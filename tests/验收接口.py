"""GrillBeats 独立站验收；仅写入带 QA 标识的数据，结束后恢复本次测试更改。"""
import argparse, copy, http.cookiejar, json, os, subprocess, time, urllib.request, urllib.error, uuid
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--base',default='http://localhost:3023');p.add_argument('--output',required=True);args=p.parse_args()
base=args.base.rstrip('/');jar=http.cookiejar.CookieJar();client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar));results=[]
def req(path,method='GET',data=None,headers=None,anon=False):
 h=headers or {};raw=data
 if isinstance(data,dict): raw=json.dumps(data).encode();h={**h,'Content-Type':'application/json'}
 r=urllib.request.Request(base+path,data=raw,headers=h,method=method)
 if not base.startswith('http://localhost') and method!='GET': time.sleep(1.2)
 try:
  with (urllib.request.urlopen(r,timeout=30) if anon else client.open(r,timeout=30)) as response:return response.status,response.read(),dict(response.headers)
 except urllib.error.HTTPError as e:return e.code,e.read(),dict(e.headers)
def check(name,condition,detail=''):
 results.append({'检查':name,'通过':bool(condition),'说明':detail});print(name, 'PASS' if condition else 'FAIL');assert condition,name
check('后台接口未登录保护',req('/api/admin/state',anon=True)[0]==401)
check('媒体上传未登录保护',req('/api/admin/upload','POST',{},anon=True)[0]==401)
check('禁用默认密码',req('/api/auth/login','POST',{'email':'admin@grillbeats.com','password':'change-me'})[0]==401)
password=os.environ.get('GRILLBEATS_ADMIN_PASSWORD') or subprocess.check_output(['security','find-generic-password','-s','GrillBeats Wholesale','-a','admin@grillbeats.com','-w'],text=True).strip()
check('独立管理员登录',req('/api/auth/login','POST',{'email':'admin@grillbeats.com','password':password})[0]==200)
del password
status,raw,_=req('/api/admin/state');state=json.loads(raw);check('GrillBeats 独立初始数据',len(state['products'])==4 and state['siteSettings']['title']=='GrillBeats' and not state['contactChannels'])
check('仅启用英文中文',state['enabledLocales']==['en','zh'])
check('公开接口不包含询盘用户',not {'users','leads','aiSettings'} & json.loads(req('/api/site-state')[1]).keys())
for label,data in [('必填',{}),('邮箱',{'fullName':'QA','email':'invalid','productType':'Round','quantity':'Not sure'}),('字段类型',{'length':{}})]:check(label+'校验',req('/api/leads','POST',data)[0]==400)
lead={'fullName':'QA acceptance '+uuid.uuid4().hex[:8],'email':'grillbeats-qa@example.com','productType':'Round bamboo skewers','quantity':'Not sure yet','length':'200 mm','diameter':'3 mm','tipType':'Round pointed','packaging':'Private label','message':'QA test data, safe to remove','locale':'en'}
status,raw,_=req('/api/leads','POST',lead);check('合法询盘成功',status==201);lead_id=json.loads(raw)['id']
def getstate():return json.loads(req('/api/admin/state')[1])
def poll(test):
 for i in range(15):
  value=getstate()
  if test(value):return value
  time.sleep(2)
 raise AssertionError('数据读取等待超时')
state=poll(lambda s:any(x['id']==lead_id for x in s['leads']));saved=next(x for x in state['leads'] if x['id']==lead_id);check('新增规格字段正确落库',all(saved[k]==lead[k] for k in ['length','diameter','tipType','packaging']))
# 保留本次基线；仅独立新站验收时操作。任何已有非测试询盘在清理时重新合并。
baseline=copy.deepcopy(state);upload_id=None
try:
 boundary='GrillBeatsQA'+uuid.uuid4().hex
 content=Path('public/assets/current-template/round.webp').read_bytes()
 body=(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="grillbeats-qa.webp"\r\nContent-Type: image/webp\r\n\r\n'.encode()+content+f'\r\n--{boundary}--\r\n'.encode())
 status,raw,_=req('/api/admin/upload','POST',body,{'Content-Type':'multipart/form-data; boundary='+boundary});check('媒体上传',status==200);upload=json.loads(raw)['file'];upload_id=upload['id']
 status,raw,_=req(upload['url']);check('媒体读取内容一致',status==200 and raw==content)
 state=poll(lambda s:any(x['id']==upload_id for x in s['uploadedFiles']))
 state['products'][0]['name']['en']='QA Bamboo Product';state['templateSettings']['heroTitle']['en']='QA GrillBeats Hero';state['templateSettings']['homeProductCount']=3
 check('后台产品模板设置保存',req('/api/admin/state','PUT',state)[0]==200)
 poll(lambda s:s['products'][0]['name']['en']=='QA Bamboo Product')
 html=req('/en')[1].decode();check('后台变更前台生效','QA Bamboo Product' in html and 'QA GrillBeats Hero' in html)
finally:
 latest=getstate();latest['products']=baseline['products'];latest['templateSettings']=baseline['templateSettings'];latest['leads']=[x for x in latest['leads'] if x['id']!=lead_id];req('/api/admin/state','PUT',latest)
 if upload_id:req('/api/admin/upload?id='+upload_id,'DELETE')
for path in ['/en','/zh','/en/products','/en/products/round-bamboo-skewers','/en/pages/custom-packaging','/en/pages/about','/en/contact','/en/articles','/sitemap.xml','/robots.txt']:
 status,raw,_=req(path);check(path+'访问与品牌',status==200 and b'KeyproTools' not in raw)
check('未完成语言不展示',req('/fr')[0]==404)
html=req('/en')[1].decode();check('主域名 canonical','rel="canonical" href="https://grillbeats.com/en"' in html)
Path(args.output).write_text(json.dumps({'地址':base,'结果':results},ensure_ascii=False,indent=2))
print('验收记录已保存；凭据未写入记录。')
