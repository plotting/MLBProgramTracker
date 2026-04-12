"""Quick diagnostic: test Chrome cookie reading for mlb26.theshow.com"""
import os, sys, json, base64, shutil, sqlite3, tempfile, ctypes, ctypes.wintypes, glob

class _DATABLOB(ctypes.Structure):
    _fields_ = [("cbData", ctypes.wintypes.DWORD),
                ("pbData", ctypes.POINTER(ctypes.c_char))]

def _dpapi_decrypt(ciphertext):
    buf = ctypes.create_string_buffer(ciphertext)
    blob_in  = _DATABLOB(len(ciphertext), buf)
    blob_out = _DATABLOB()
    ok = ctypes.windll.crypt32.CryptUnprotectData(
        ctypes.byref(blob_in), None, None, None, None, 0, ctypes.byref(blob_out))
    if not ok:
        raise RuntimeError(f"DPAPI failed, GetLastError={ctypes.GetLastError()}")
    result = ctypes.string_at(blob_out.pbData, blob_out.cbData)
    ctypes.windll.kernel32.LocalFree(blob_out.pbData)
    return result

def _get_aes_key(local_state_path):
    with open(local_state_path, encoding="utf-8") as f:
        ls = json.load(f)
    enc_key_b64 = ls["os_crypt"]["encrypted_key"]
    enc_key = base64.b64decode(enc_key_b64)
    return _dpapi_decrypt(enc_key[5:])

def _decrypt_v10(value, aes_key):
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    nonce = value[3:15]
    ciphertext = value[15:]
    return AESGCM(aes_key).decrypt(nonce, ciphertext, None).decode("utf-8", errors="replace")

def read_locked_file(path):
    """Read a file that Chrome has open, using FILE_SHARE_READ|WRITE|DELETE."""
    GENERIC_READ          = 0x80000000
    FILE_SHARE_READ       = 0x00000001
    FILE_SHARE_WRITE      = 0x00000002
    FILE_SHARE_DELETE     = 0x00000004
    OPEN_EXISTING         = 3
    FILE_ATTRIBUTE_NORMAL = 0x00000080
    INVALID_HANDLE_VALUE  = -1

    k32 = ctypes.windll.kernel32
    k32.CreateFileW.argtypes = [
        ctypes.c_wchar_p,  # lpFileName
        ctypes.c_uint32,   # dwDesiredAccess
        ctypes.c_uint32,   # dwShareMode
        ctypes.c_void_p,   # lpSecurityAttributes
        ctypes.c_uint32,   # dwCreationDisposition
        ctypes.c_uint32,   # dwFlagsAndAttributes
        ctypes.c_void_p,   # hTemplateFile
    ]
    k32.CreateFileW.restype = ctypes.c_void_p

    h = k32.CreateFileW(
        path,
        GENERIC_READ,
        FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
        None,
        OPEN_EXISTING,
        FILE_ATTRIBUTE_NORMAL,
        None
    )
    print(f"    CreateFileW handle: {h!r}")
    if h is None or h == INVALID_HANDLE_VALUE or h == ctypes.cast(ctypes.c_void_p(-1), ctypes.c_void_p).value:
        err = ctypes.GetLastError()
        raise OSError(f"CreateFileW failed, LastError={err}")

    try:
        # Get file size
        size_high = ctypes.c_uint32(0)
        k32.GetFileSize.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_uint32)]
        k32.GetFileSize.restype  = ctypes.c_uint32
        size_low = k32.GetFileSize(h, ctypes.byref(size_high))
        size = (size_high.value << 32) | size_low
        print(f"    File size: {size} bytes")
        if size == 0 or size > 500 * 1024 * 1024:
            raise OSError(f"Unexpected size: {size}")

        buf  = (ctypes.c_char * size)()
        read = ctypes.c_uint32(0)
        k32.ReadFile.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint32,
                                  ctypes.POINTER(ctypes.c_uint32), ctypes.c_void_p]
        k32.ReadFile.restype  = ctypes.c_int32
        ok = k32.ReadFile(h, buf, size, ctypes.byref(read), None)
        if not ok:
            err = ctypes.GetLastError()
            raise OSError(f"ReadFile failed, LastError={err}")
        return bytes(buf)[:read.value]
    finally:
        k32.CloseHandle.argtypes = [ctypes.c_void_p]
        k32.CloseHandle(h)


domain = "mlb26.theshow.com"
local_appdata = os.environ.get("LOCALAPPDATA", "")
profiles = [
    ("Chrome", os.path.join(local_appdata, "Google", "Chrome", "User Data")),
    ("Edge",   os.path.join(local_appdata, "Microsoft", "Edge", "User Data")),
]

for browser, user_data in profiles:
    if not os.path.exists(user_data):
        print(f"\n{browser}: NOT INSTALLED")
        continue
    print(f"\n{browser}: {user_data}")

    ls_path = os.path.join(user_data, "Local State")
    aes_key = None
    if os.path.exists(ls_path):
        try:
            aes_key = _get_aes_key(ls_path)
            print(f"  AES key: OK ({len(aes_key)} bytes)")
        except Exception as e:
            print(f"  AES key: FAILED: {e}")

    cookie_paths = (
        glob.glob(os.path.join(user_data, "Default", "Cookies")) +
        glob.glob(os.path.join(user_data, "Default", "Network", "Cookies")) +
        glob.glob(os.path.join(user_data, "Profile*", "Cookies")) +
        glob.glob(os.path.join(user_data, "Profile*", "Network", "Cookies"))
    )
    print(f"  Cookie files: {len(cookie_paths)}")

    for cp in cookie_paths:
        print(f"  File: {cp}")
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        tmp.close()
        try:
            try:
                data = read_locked_file(cp)
                with open(tmp.name, 'wb') as f:
                    f.write(data)
                print(f"    Locked-file read OK ({len(data)} bytes)")
            except Exception as e:
                print(f"    Locked-file read FAILED: {e}")
                # Last resort: PowerShell
                ps_script = f"""
$stream = [System.IO.File]::Open('{cp.replace(chr(39), '')}', [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
$bytes = New-Object byte[] $stream.Length
$stream.Read($bytes, 0, $bytes.Length)
$stream.Close()
[System.IO.File]::WriteAllBytes('{tmp.name.replace(chr(39), '')}', $bytes)
"""
                try:
                    r = __import__('subprocess').run(
                        ["powershell", "-Command", ps_script],
                        capture_output=True, timeout=15, text=True
                    )
                    if r.returncode == 0 and os.path.getsize(tmp.name) > 0:
                        print(f"    PowerShell copy OK ({os.path.getsize(tmp.name)} bytes)")
                    else:
                        print(f"    PowerShell FAILED: {r.stderr[:200]}")
                        continue
                except Exception as pe:
                    print(f"    PowerShell FAILED: {pe}")
                    continue

            con = sqlite3.connect(tmp.name)
            con.row_factory = sqlite3.Row
            try:
                rows = con.execute(
                    "SELECT name, host_key, value, encrypted_value FROM cookies "
                    "WHERE host_key LIKE ?", (f"%{domain}%",)
                ).fetchall()
            except Exception as qe:
                print(f"    Query failed: {qe}")
                rows = []
            print(f"    Rows for {domain}: {len(rows)}")
            for row in rows:
                name = row["name"]
                val  = row["value"] or ""
                enc  = bytes(row["encrypted_value"] or b"")
                if not val and enc and aes_key and enc[:3] == b"v10":
                    try:
                        val = _decrypt_v10(enc, aes_key)
                        print(f"      {name}: {val[:40]}...")
                    except Exception as de:
                        print(f"      {name}: decrypt FAILED: {de}")
                elif val:
                    print(f"      {name}: {val[:40]}...")
                else:
                    print(f"      {name}: EMPTY (enc len={len(enc)})")
            con.close()
        finally:
            try: os.unlink(tmp.name)
            except: pass
