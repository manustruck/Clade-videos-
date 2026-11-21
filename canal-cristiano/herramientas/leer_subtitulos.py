import cv2,pytesseract,sys,re
i=sys.argv[1]; cap=cv2.VideoCapture(f"v{i}.mp4"); fps=cap.get(5); n=int(cap.get(7))
out=[]; k=0; last=""; prevsm=None
while True:
    ok,f=cap.read()
    if not ok: break
    k+=1
    if k%6: continue
    t=k/fps
    if t>n/fps-3.5: break
    b=f[150:290]
    g=cv2.cvtColor(b,cv2.COLOR_BGR2GRAY)
    sm=cv2.resize(g,(72,17)).astype(int)
    if prevsm is not None and abs(sm-prevsm).mean()<2.0: continue
    prevsm=sm
    g=cv2.resize(g,None,fx=2.5,fy=2.5,interpolation=cv2.INTER_CUBIC)
    _,th=cv2.threshold(g,175,255,cv2.THRESH_BINARY_INV)
    txt=pytesseract.image_to_string(th,lang="spa",config="--psm 6").strip().replace("\n"," ")
    txt=re.sub(r"[^\wáéíóúñÁÉÍÓÚÑüÜ¿?¡!.,:;«»\-\d ]","",txt).strip()
    if txt and txt!=last:
        out.append(f"{t:5.1f} {txt}"); last=txt
        open(f"ocr_v{i}.part","w").write("\n".join(out))
open(f"ocr_v{i}.txt","w").write("\n".join(out))
