import re, html as html_module

with open('debug_orioles_program.html', encoding='utf-8', errors='replace') as f:
    body = f.read()

blocks = re.findall(
    r"mlb26-program-accordion-sub[\"'][^>]*>.*?</div>\s*</div>\s*</div>\s*</div>",
    body, re.DOTALL | re.IGNORECASE
)
print(f'Found {len(blocks)} accordion-sub blocks')
for blk in blocks:
    m_title = re.search(
        r"class=[\"'][^\"']*accordion-toggle-label[^\"']*[\"'][^>]*>\s*(.*?)\s*</span>",
        blk, re.DOTALL | re.IGNORECASE
    )
    title = html_module.unescape(re.sub(r'<[^>]+>', '', m_title.group(1))).strip() if m_title else ''

    m_meter = re.search(r"<meter[^>]+max=['\"](\d+)['\"][^>]+value=['\"](\d+)['\"]", blk, re.IGNORECASE)
    if not m_meter:
        m_meter = re.search(r"<meter[^>]+value=['\"](\d+)['\"][^>]+max=['\"](\d+)['\"]", blk, re.IGNORECASE)
        if m_meter:
            cur_val, max_val = m_meter.group(1), m_meter.group(2)
        else:
            cur_val, max_val = '0', '0'
    else:
        max_val, cur_val = m_meter.group(1), m_meter.group(2)

    m_rnum = re.search(r"class=['\"]reward['\"][^>]*>(.*?)</div>", blk, re.DOTALL)
    reward = ''
    if m_rnum:
        r_text = html_module.unescape(re.sub(r'<[^>]+>', ' ', m_rnum.group(1))).strip()
        mn = re.search(r'([\d,]+)', r_text)
        if mn:
            reward = mn.group(1).replace(',','') + ' XP'

    try:
        pct = min(100.0, round(int(cur_val)/int(max_val)*100,1)) if int(max_val)>0 else 0.0
    except:
        pct = 0.0

    print(f'  [{pct:5.1f}%] {title[:50]!s:<50} | prog={cur_val}/{max_val} | reward={reward}')
