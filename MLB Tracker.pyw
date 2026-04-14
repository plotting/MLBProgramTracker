"""
MLB The Show 26 Tracker — GUI launcher
Double-click to run. No console window.
"""
import tkinter as tk
from tkinter import font as tkfont, messagebox
import subprocess, sys, os, threading, webbrowser

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
FETCH_SCRIPT = os.path.join(SCRIPT_DIR, "fetch_mlb26.py")
HTML_OUT     = os.path.join(SCRIPT_DIR, "MLB Team Affinity Tracker.html")

BG      = "#080d18"
SURFACE = "#0f1923"
SURFACE2= "#162031"
BORDER  = "#1e3554"
TEXT    = "#e2e8f0"
MUTED   = "#64748b"
BLUE    = "#3b9edd"
GREEN   = "#22c55e"
RED     = "#ef4444"
AMBER   = "#f59e0b"


class App:
    def __init__(self, root: tk.Tk):
        self.root    = root
        self.running = False

        root.title("MLB The Show 26 Tracker")
        root.configure(bg=BG)
        root.geometry("600x480")
        root.minsize(480, 380)
        root.resizable(True, True)

        self._build_ui()

    # ── UI construction ────────────────────────────────────────────────────────

    def _build_ui(self):
        # Header
        hdr = tk.Frame(self.root, bg=BG, height=56)
        hdr.pack(fill="x", side="top")
        hdr.pack_propagate(False)
        tk.Label(hdr, text="MLB The Show 26", bg=BG, fg=BLUE,
                 font=("Segoe UI", 14, "bold")).pack(side="left", padx=16, pady=14)
        tk.Label(hdr, text="Team Affinity Tracker", bg=BG, fg=MUTED,
                 font=("Segoe UI", 10)).pack(side="left", pady=14)

        sep = tk.Frame(self.root, bg=BORDER, height=1)
        sep.pack(fill="x")

        # Button row
        btn_row = tk.Frame(self.root, bg=BG, pady=12)
        btn_row.pack(fill="x", padx=16)

        self.btn = tk.Button(
            btn_row, text="  Refresh Live Data  ",
            bg=BLUE, fg="white", activebackground="#2d85c0", activeforeground="white",
            relief="flat", bd=0, font=("Segoe UI", 11, "bold"),
            padx=18, pady=8, cursor="hand2",
            command=self._start_fetch,
        )
        self.btn.pack(side="left")

        self.open_btn = tk.Button(
            btn_row, text="Open Tracker",
            bg=SURFACE2, fg=TEXT, activebackground=SURFACE, activeforeground=TEXT,
            relief="flat", bd=0, font=("Segoe UI", 10),
            padx=12, pady=8, cursor="hand2",
            command=self._open_html,
            state="normal" if os.path.exists(HTML_OUT) else "disabled",
        )
        self.open_btn.pack(side="left", padx=10)

        # Log area
        log_frame = tk.Frame(self.root, bg=SURFACE, bd=0)
        log_frame.pack(fill="both", expand=True, padx=16, pady=(0, 0))

        self.log = tk.Text(
            log_frame, bg=SURFACE, fg=TEXT, insertbackground=TEXT,
            font=("Consolas", 9), relief="flat", bd=0,
            state="disabled", wrap="word",
            selectbackground=SURFACE2, selectforeground=TEXT,
        )
        sb = tk.Scrollbar(log_frame, orient="vertical", command=self.log.yview,
                          bg=SURFACE2, troughcolor=SURFACE, activebackground=BORDER)
        self.log.configure(yscrollcommand=sb.set)
        sb.pack(side="right", fill="y")
        self.log.pack(side="left", fill="both", expand=True, padx=8, pady=8)

        # Configure text tags for coloring
        self.log.tag_configure("ok",    foreground=GREEN)
        self.log.tag_configure("err",   foreground=RED)
        self.log.tag_configure("warn",  foreground=AMBER)
        self.log.tag_configure("info",  foreground=BLUE)
        self.log.tag_configure("muted", foreground=MUTED)

        # Status bar
        status_sep = tk.Frame(self.root, bg=BORDER, height=1)
        status_sep.pack(fill="x")

        status_bar = tk.Frame(self.root, bg=SURFACE, height=28)
        status_bar.pack(fill="x")
        status_bar.pack_propagate(False)

        self.status_dot = tk.Label(status_bar, text="●", bg=SURFACE, fg=MUTED,
                                   font=("Segoe UI", 9))
        self.status_dot.pack(side="left", padx=(10, 4), pady=4)
        self.status_lbl = tk.Label(status_bar, text="Ready", bg=SURFACE, fg=MUTED,
                                   font=("Segoe UI", 9))
        self.status_lbl.pack(side="left", pady=4)

        self._log("MLB The Show 26 Tracker ready.\n", "muted")

    # ── Logging ───────────────────────────────────────────────────────────────

    def _log(self, text: str, tag: str = ""):
        self.log.configure(state="normal")
        if tag:
            self.log.insert("end", text, tag)
        else:
            self.log.insert("end", text)
        self.log.see("end")
        self.log.configure(state="disabled")

    def _log_line(self, line: str):
        """Color-tag a line based on its content."""
        lo = line.lower()
        if any(x in lo for x in ("error", "fail", "traceback", "exception")):
            tag = "err"
        elif any(x in lo for x in ("done!", "saved:", "all done", "complete")):
            tag = "ok"
        elif any(x in lo for x in ("found", "fetching", "checking", "rebuilding", "using cached")):
            tag = "info"
        elif any(x in lo for x in ("skip", "warning", "not found")):
            tag = "warn"
        else:
            tag = ""
        self._log(line + "\n", tag)

    # ── Status bar helpers ────────────────────────────────────────────────────

    def _set_status(self, text: str, color: str):
        self.status_dot.configure(fg=color)
        self.status_lbl.configure(text=text, fg=color)

    # ── Fetch logic ───────────────────────────────────────────────────────────

    def _start_fetch(self):
        if self.running:
            return
        self.running = True
        self.btn.configure(state="disabled", text="  Refreshing...  ", bg="#1a5a82")
        self._set_status("Fetching live data…", AMBER)
        self._log("\n── Starting fetch ──────────────────────\n", "muted")
        t = threading.Thread(target=self._fetch_thread, daemon=True)
        t.start()

    def _fetch_thread(self, extra_args=None):
        auth_hints = (
            "cannot read cookies", "chrome is running and no cache",
            "no cookies found", "no credentials", "stale cached cookies",
            "authentication", "unauthorized", "403", "401",
            "error: cannot", "error: no cookies",
            # Zero-data signals — stale session authenticated but returned empty page
            "found 0 program links", "0 teams fetched", "session token is likely expired",
            "0 across 0 teams",
        )
        auth_issue = False
        try:
            cmd = [sys.executable, FETCH_SCRIPT, "--no-browser"] + (extra_args or [])
            proc = subprocess.Popen(
                cmd,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                cwd=SCRIPT_DIR,
                bufsize=1,
            )
            for line in proc.stdout:
                line = line.rstrip("\n\r")
                self.root.after(0, self._log_line, line)
                lo = line.lower()
                if any(h in lo for h in auth_hints):
                    auth_issue = True
            proc.wait()
            success = proc.returncode == 0
        except Exception as e:
            self.root.after(0, self._log, f"Launch error: {e}\n", "err")
            success = False
            auth_issue = False

        if not success:
            self.root.after(0, self._prompt_reauth, auth_issue)
        else:
            self.root.after(0, self._fetch_done, True)

    def _prompt_reauth(self, auth_issue: bool = True):
        self.running = False
        self.btn.configure(state="normal", text="  Refresh Live Data  ", bg=BLUE)
        self._set_status("Waiting — action required", AMBER)

        win = tk.Toplevel(self.root)
        win.title("Re-authenticate")
        win.configure(bg=BG)
        win.geometry("500x360")
        win.resizable(False, False)
        win.grab_set()

        tk.Label(win, text="Session Expired — Re-authenticate", bg=BG, fg=TEXT,
                 font=("Segoe UI", 12, "bold")).pack(pady=(18, 4))

        if auth_issue:
            subtitle = ("The session token has expired (~24 hrs). The site authenticated\n"
                        "but returned no data. Refresh your session to continue:")
        else:
            subtitle = ("The fetch failed. Try refreshing your session\n"
                        "or paste a fresh cookie from Chrome DevTools:")
        tk.Label(win, text=subtitle, bg=BG, fg=MUTED,
                 font=("Segoe UI", 9), justify="center").pack(pady=(0, 12))

        sep = tk.Frame(win, bg=BORDER, height=1)
        sep.pack(fill="x", padx=20)

        # Option 1 — open browser so Chrome gets a fresh cookie, then retry
        opt1 = tk.Frame(win, bg=BG)
        opt1.pack(fill="x", padx=20, pady=(10, 4))
        tk.Label(opt1, text="Option 1", bg=BG, fg=BLUE,
                 font=("Segoe UI", 9, "bold")).pack(anchor="w")
        tk.Label(opt1,
                 text="Open mlb26.theshow.com, log in (or just visit the page if already logged in),\n"
                      "then click Retry. Chrome must be open so fresh cookies can be read.",
                 bg=BG, fg=MUTED, font=("Segoe UI", 8)).pack(anchor="w", pady=(2, 6))

        btn_row1 = tk.Frame(opt1, bg=BG)
        btn_row1.pack(fill="x")

        def _open_site():
            import webbrowser as _wb
            _wb.open("https://mlb26.theshow.com")

        tk.Button(btn_row1, text="Open Site", bg=SURFACE2, fg=TEXT, relief="flat",
                  padx=10, pady=3, font=("Segoe UI", 9), cursor="hand2",
                  command=_open_site).pack(side="left")

        tk.Button(btn_row1, text="Retry Fetch →", bg=BLUE, fg="white", relief="flat",
                  padx=10, pady=3, font=("Segoe UI", 9, "bold"), cursor="hand2",
                  command=lambda: [win.destroy(), self._start_fetch()]).pack(side="right")

        sep2 = tk.Frame(win, bg=BORDER, height=1)
        sep2.pack(fill="x", padx=20)

        # Option 2 — paste cookie manually
        opt2 = tk.Frame(win, bg=BG)
        opt2.pack(fill="x", padx=20, pady=(10, 4))
        tk.Label(opt2, text="Option 2", bg=BG, fg=BLUE,
                 font=("Segoe UI", 9, "bold")).pack(anchor="w")
        tk.Label(opt2,
                 text="Paste your _tsn_session cookie directly:\n"
                      "(Chrome: F12 → Application → Cookies → mlb26.theshow.com → _tsn_session)",
                 bg=BG, fg=MUTED, font=("Segoe UI", 8)).pack(anchor="w", pady=(2, 6))

        cookie_frame = tk.Frame(opt2, bg=BG)
        cookie_frame.pack(fill="x")
        tk.Label(cookie_frame, text="_tsn_session:", bg=BG, fg=TEXT,
                 font=("Segoe UI", 8), width=14, anchor="w").pack(side="left")
        session_var = tk.StringVar()
        session_entry = tk.Entry(cookie_frame, textvariable=session_var,
                                 bg=SURFACE2, fg=TEXT, insertbackground=TEXT,
                                 relief="flat", font=("Consolas", 8))
        session_entry.pack(side="left", fill="x", expand=True, ipady=4)
        session_entry.focus_set()

        def _use_cookie():
            val = session_var.get().strip()
            if not val:
                messagebox.showwarning("Empty", "Please paste your _tsn_session value.",
                                       parent=win)
                return
            win.destroy()
            self._start_fetch_with_cookie(val)

        tk.Button(opt2, text="Use Cookie & Fetch", bg=GREEN, fg="#000",
                  relief="flat", padx=10, pady=3,
                  font=("Segoe UI", 9, "bold"), cursor="hand2",
                  command=_use_cookie).pack(anchor="e", pady=(6, 0))

        sep3 = tk.Frame(win, bg=BORDER, height=1)
        sep3.pack(fill="x", padx=20, pady=(8, 0))

        tk.Button(win, text="Cancel", bg=SURFACE2, fg=MUTED, relief="flat",
                  padx=10, pady=3, font=("Segoe UI", 8), cursor="hand2",
                  command=lambda: [win.destroy(),
                                   self._set_status("Cancelled", MUTED)]).pack(pady=(6, 0))

    def _start_fetch_with_cookie(self, session_value: str):
        if self.running:
            return
        self.running = True
        self.btn.configure(state="disabled", text="  Refreshing...  ", bg="#1a5a82")
        self._set_status("Fetching live data…", AMBER)
        self._log("\n── Starting fetch (manual cookie) ─────\n", "muted")
        t = threading.Thread(target=self._fetch_thread,
                             kwargs={"extra_args": ["--cookie",
                                                    f"_tsn_session={session_value}"]},
                             daemon=True)
        t.start()

    def _fetch_done(self, success: bool):
        self.running = False
        self.btn.configure(state="normal", text="  Refresh Live Data  ", bg=BLUE)
        self._set_status("Done — tracker updated", GREEN)
        self._log("\n── Fetch complete ──────────────────────\n", "ok")
        self.open_btn.configure(state="normal")
        self._open_html()

    def _open_html(self):
        if os.path.exists(HTML_OUT):
            try:
                os.startfile(HTML_OUT)          # always loads fresh from disk on Windows
            except Exception:
                webbrowser.open("file:///" + HTML_OUT.replace("\\", "/"))
        else:
            self._log("Tracker HTML not found — run a fetch first.\n", "warn")


if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()
