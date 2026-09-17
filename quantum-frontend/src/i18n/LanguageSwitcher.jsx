import { useLanguage } from './language.js';
export default function LanguageSwitcher(){
  const {language,setLanguage}=useLanguage();
  return <label className="language-switcher"><span>Language</span><select aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value)}><option value="en" translate="no" lang="en">English</option><option value="vi" translate="no" lang="vi">Tiếng Việt</option></select></label>;
}
