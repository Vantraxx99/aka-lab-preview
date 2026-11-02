"""Genera progetti/<slug>.html dalla home (head, header, footer) e da content/progetti.json."""
import json, os, re, sys, html

R = sys.argv[1]
idx = open(os.path.join(R, 'index.html')).read()
data = json.load(open(os.path.join(R, 'content/progetti.json')))
by = {p['slug']: p for p in data}
SERV = {"strategy": "Strategy & Marketing", "content": "Content, Social & Creator",
        "partnership": "Partnership & Business Development", "event": "Event & Talent Management"}

head = re.search(r'<head>(.*?)</head>', idx, re.S).group(1)
head = re.sub(r'<title>.*?</title>', '<title>{TITLE}</title>', head)
head = re.sub(r'<meta name="description" content=".*?">', '<meta name="description" content="{DESC}">', head)
header = re.search(r'  <!-- NAV -->\n(.*?</header>)', idx, re.S).group(1)
footer = re.search(r'  <!-- FOOTER -->\n(.*?</footer></div>)', idx, re.S).group(1)
cta = re.search(r'  <!-- CTA -->\n(.*?</section>)', idx, re.S).group(1)

def rel(block):
    block = re.sub(r'href="#(top|approccio|servizi|portfolio|agenzia)"', r'href="../index.html#\1"', block)
    block = block.replace('href="admin.html"', 'href="../admin.html"')
    return block

header, footer = rel(header), rel(footer)
e = lambda s: html.escape(s, quote=True)
EY = 'margin: 0 0 20px; font-size: 13px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase'
H2 = 'margin: 0; font-family: Anton, sans-serif; font-weight: 400; text-transform: uppercase; line-height: .95'
WRAP = 'max-width: 1360px; margin: 0 auto; padding: clamp(64px, 9vw, 120px) clamp(16px, 4vw, 48px)'

def page(p):
    chips = ''.join(f'<span style="border: 1px solid #120F0E; padding: 8px 14px; font-size: 13px; font-weight: 600">{e(d)}</span>' for d in p['discipline'])
    stats = ''.join(f'''
          <div class="stat" style="padding: 28px 24px 28px 0; border-top: 1px solid rgba(251,250,249,.2)">
            <p style="margin: 0; font-family: Anton, sans-serif; font-size: clamp(56px, 7vw, 112px); line-height: 1; color: #FBFAF9">{e(r["valore"])}</p>
            <p style="margin: 10px 0 0; font-size: 13px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #A8A29A">{e(r["label"])}</p>
          </div>''' for r in p['risultati'])
    steps = ''.join(f'''
              <div style="border-top: 1px solid #120F0E; padding-top: 24px">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #9B1E22">0{i+1}</p>
                <h3 style="margin: 12px 0 10px; font-family: Anton, sans-serif; font-weight: 400; font-size: clamp(28px, 2.6vw, 38px); text-transform: uppercase; line-height: 1">{e(s["titolo"])}</h3>
                <p style="margin: 0; font-size: 17px; line-height: 1.55; color: #3B3733">{e(s["testo"])}</p>
              </div>''' for i, s in enumerate(p['strategia']))
    iniz = ''.join(f'''
              <article style="background: #FBFAF9; color: #120F0E; padding: clamp(24px, 3vw, 36px); display: flex; flex-direction: column; gap: 12px">
                <p style="margin: 0; font-size: 12px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #9B1E22">{e(x["kicker"])}</p>
                <h3 style="margin: 0; font-family: Anton, sans-serif; font-weight: 400; font-size: clamp(30px, 3vw, 44px); text-transform: uppercase; line-height: 1">{e(x["titolo"])}</h3>
                {f'<p style="margin: 0; font-size: 14px; font-style: italic; color: #5C5650">{e(x["partner"])}</p>' if x["partner"] else ''}
                <p style="margin: 0; font-size: 17px; line-height: 1.55; color: #3B3733">{e(x["testo"])}</p>
              </article>''' for x in p['iniziative'])
    mats = ''.join(f'''
              <figure style="margin: 0; aspect-ratio: 4 / 3; background: repeating-linear-gradient(135deg, #E1DDDA 0 14px, #EAE7E5 14px 28px); display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box">
                <figcaption style="font-size: 13px; color: #3B3733; background: #FBFAF9; padding: 6px 10px">[ Foto: {e(m)} ]</figcaption>
              </figure>''' for m in p['materiali'])
    servs = ''.join(f'<a class="btn" href="../index.html#{s}" style="text-decoration: none; color: #120F0E; border: 1px solid #120F0E; padding: 14px 18px; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase">{e(SERV[s])} →</a>' for s in p['servizi'])
    nxt = by[p['successivo']]

    sec_strategia = f'''
      <section style="{WRAP}">
        <p style="{EY}; color: #9B1E22">Strategia e attività</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: clamp(24px, 3vw, 48px)">{steps}
        </div>
      </section>''' if p['strategia'] else ''
    sec_iniz = f'''
      <div style="background: #9B1E22; color: #FBFAF9"><section style="{WRAP}">
        <h2 style="{H2}; font-size: clamp(44px, 6vw, 88px); margin-bottom: 40px">{e(p["iniziative_titolo"])}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 20px">{iniz}
        </div>
      </section></div>''' if p['iniziative'] else ''

    body = f'''
    <div style="font-family: Archivo, system-ui, sans-serif; color: #120F0E; background: #FBFAF9; width: 100%; overflow-x: clip">

      {header}

      <section style="max-width: 1360px; margin: 0 auto; padding: clamp(40px, 6vw, 80px) clamp(16px, 4vw, 48px) clamp(48px, 6vw, 80px)">
        <a href="../index.html#portfolio" style="font-size: 13px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #120F0E; text-decoration: none">← Tutti i progetti</a>
        <p style="{EY}; color: #9B1E22; margin-top: 40px">Progetti · {e(p["etichetta"])}</p>
        <h1 style="margin: 0; font-family: Anton, sans-serif; font-weight: 400; font-size: clamp(54px, 10vw, 160px); line-height: .9; text-transform: uppercase">
          <span class="ln"><span>{e(p["titolo"])}</span></span>
        </h1>
        <div class="fade">
          <p style="margin: 32px 0 28px; max-width: 720px; font-size: clamp(19px, 1.7vw, 24px); line-height: 1.5; color: #3B3733">{e(p["sottotitolo"])}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px">{chips}</div>
        </div>
      </section>

      <figure style="margin: 0 auto; max-width: 1360px; padding: 0 clamp(16px, 4vw, 48px)">
        <div style="aspect-ratio: 21 / 9; background: repeating-linear-gradient(135deg, #E1DDDA 0 14px, #EAE7E5 14px 28px); display: flex; align-items: center; justify-content: center; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: #5C5650; text-align: center; padding: 16px; box-sizing: border-box">[ Foto principale: {e(p["materiali"][0])} ]</div>
      </figure>

      <div style="background: #120F0E; color: #FBFAF9; margin-top: clamp(64px, 9vw, 120px)"><section style="{WRAP}">
        <p style="{EY}; color: #E8605B">Risultati documentati</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); column-gap: 32px">{stats}
        </div>
        <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.5; color: #A8A29A; max-width: 640px">{e(p["nota"])}</p>
      </section></div>

      <section style="{WRAP}">
        <p style="{EY}; color: #9B1E22">Obiettivo</p>
        <h2 style="{H2}; font-size: clamp(40px, 5.6vw, 84px); max-width: 1100px">{e(p["obiettivo"])}</h2>
      </section>
    {sec_strategia}
    {sec_iniz}

      <section style="{WRAP}">
        <p style="{EY}; color: #9B1E22">Materiali</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 20px">{mats}
        </div>
        <p style="{EY}; color: #5C5650; margin-top: 64px">Servizi coinvolti</p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px">{servs}</div>
      </section>

      <a class="next" href="{nxt["slug"]}.html" style="display: block; text-decoration: none; color: #120F0E; border-top: 1px solid #120F0E; border-bottom: 1px solid #120F0E">
        <div style="max-width: 1360px; margin: 0 auto; padding: clamp(48px, 7vw, 96px) clamp(16px, 4vw, 48px); display: flex; justify-content: space-between; align-items: center; gap: 24px">
          <div>
            <p style="{EY}; color: #5C5650">Progetto successivo</p>
            <p style="margin: 0; font-family: Anton, sans-serif; font-size: clamp(40px, 7vw, 112px); line-height: .95; text-transform: uppercase">{e(nxt["titolo"])}</p>
          </div>
          <svg class="arr" aria-hidden="true" width="56" height="56" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" style="flex: none"><path d="M2 7h10M8 3l4 4-4 4"></path></svg>
        </div>
      </a>

      {cta}

      {footer}
    </div>'''
    return f'''<!doctype html>
<html lang="it">
<head>{head.replace("{TITLE}", e(p["titolo"]) + " — Case study AKA LAB").replace("{DESC}", e(p["obiettivo"]))}
<style>.next{{transition:background-color .35s ease,color .35s ease}}.next:hover{{background:#9B1E22;color:#FBFAF9}}.next:hover p{{color:#FBFAF9 !important}}.next .arr{{transition:transform .35s ease}}.next:hover .arr{{transform:translateX(8px)}}</style>
</head>
<body>
{body}
</body>
</html>
'''

os.makedirs(os.path.join(R, 'progetti'), exist_ok=True)
for p in data:
    open(os.path.join(R, 'progetti', p['slug'] + '.html'), 'w').write(page(p))
    print('ok', p['slug'])
