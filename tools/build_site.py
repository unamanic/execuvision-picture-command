#!/usr/bin/env python3
"""Bundle the local site into one offline HTML file; no historical artwork."""
from pathlib import Path
import hashlib,base64,shutil,re,runpy
root=Path(__file__).resolve().parents[1];web=root/'web';out=root/'dist';out.mkdir(exist_ok=True)
runpy.run_path(str(root/'tools/build_sevenzip.py'))
html=(web/'index.html').read_text();css=(web/'style.css').read_text();js=(web/'sevenzip-assets.js').read_text()+'\n'+(web/'sevenzip-reader.js').read_text()+'\n'+(web/'execuvision.js').read_text()+'\n'+(web/'zip-reader.js').read_text()+'\n'+(web/'app.js').read_text()
def token(s):return "'sha256-"+base64.b64encode(hashlib.sha256(s.encode()).digest()).decode()+"'"
html=html.replace("script-src 'self'",'script-src '+token(js)).replace("style-src 'self'",'style-src '+token(css))
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=re.sub(r'<script defer src="[^"]+"></script>','',html)
html=html.replace('</body>','<script>'+js+'</script></body>')
(out/'ExecuVision-Picture-Desk.html').write_text(html)
(out/'README.md').write_text((web/'README.md').read_text().replace('Open `index.html`', 'Open `ExecuVision-Picture-Desk.html`'))
shutil.copyfile(root/'licenses/pcmill-MIT.txt',out/'pcmill-MIT.txt')
print(out/'ExecuVision-Picture-Desk.html',len(html),'characters')

shutil.copyfile(web/'vendor/7z/License.txt',out/'7z-License.txt')
shutil.copyfile(web/'vendor/7z/unRarLicense.txt',out/'unRarLicense.txt')

shutil.copyfile(out/'ExecuVision-Picture-Desk.html',out/'index.html')
(out/'.nojekyll').touch()
shutil.copyfile(root/'licenses/LGPL-2.1.txt',out/'LGPL-2.1.txt')
shutil.copytree(root/'third_party',out/'third_party',dirs_exist_ok=True)
