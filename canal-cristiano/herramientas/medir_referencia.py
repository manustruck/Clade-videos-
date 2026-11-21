import cv2,numpy as np,sys,json
from sklearn.cluster import KMeans
def hx(c): return "#%02x%02x%02x"%tuple(int(x) for x in c[::-1])
res={}
for i in range(1,9):
    cap=cv2.VideoCapture(f"v{i}.mp4"); fps=cap.get(5); n=int(cap.get(7))
    prev=None; diffs=[]; px=[]; br=[]; sat=[]; tops=[]; bots=[]; k=0
    while True:
        ok,f=cap.read()
        if not ok: break
        k+=1
        if k%3: continue
        s=cv2.resize(f,(144,256))
        # tapar marca TikTok y ultimos 3s (pantalla final)
        g=cv2.cvtColor(s,cv2.COLOR_BGR2GRAY).astype(np.float32)
        if prev is not None: diffs.append(np.abs(g-prev).mean())
        prev=g
        if k/fps > n/fps-3.5: continue
        hsv=cv2.cvtColor(s,cv2.COLOR_BGR2HSV)
        br.append(hsv[...,2].mean()/255); sat.append(hsv[...,1].mean()/255)
        if k%15==0: px.append(s[::4,::4].reshape(-1,3))
        tops.append(s[:20].reshape(-1,3).mean(0)); bots.append(s[-60:-30].reshape(-1,3).mean(0))
    d=np.array(diffs)
    P=np.concatenate(px).astype(np.float32)
    km=KMeans(7,n_init=4,random_state=0).fit(P)
    cnt=np.bincount(km.labels_); order=np.argsort(-cnt)
    pal=[(hx(km.cluster_centers_[j]),round(cnt[j]/cnt.sum()*100)) for j in order]
    res[f"v{i}"]=dict(dur=round(n/fps,1),
      mov_pct=round(float((d>0.6).mean()*100)), quieto_pct=round(float((d<0.25).mean()*100)),
      brillo=round(float(np.mean(br)),2), brillo_p5=round(float(np.percentile(br,5)),2), sat=round(float(np.mean(sat)),2),
      paleta=pal, arriba=hx(np.median(tops,0)), abajo=hx(np.median(bots,0)))
    print(f"v{i}",json.dumps(res[f"v{i}"],ensure_ascii=False))
json.dump(res,open("medidas.json","w"),ensure_ascii=False,indent=1)
