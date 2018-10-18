define("main-adapter",function(){}),define("api/dispatcher",[],function(){function a(){this._observers={}}var b="<empty>";return a.prototype={constructor:a,notify:function(a,c,d){var e=!1,f=this._observers[a||b];return f&&f.forEach(function(b){var f=[c,d];a&&f.unshift(a),b.callback.apply(b.ctx,f)&&(e=!0)}),e},notifyAsync:function(a,b,c){var d=this;setTimeout(function(){d.notify(a,b,c)},1)},addListener:function(a,c,d){return c?(a=a||b,(this._observers[a]=this._observers[a]||[]).push({callback:c,ctx:d||null}),c):null},clear:function(){this._observers={}},removeListener:function(a,c,d){if(a=a||b,c){var e=this._observers[a];e&&(d=d||null,this._observers[a]=e.filter(function(a){return!(a.callback===c&&d==a.ctx)}))}else delete this._observers[a]}},a}),define("browser-adapter",["require","api/dispatcher"],function(a){"use strict";function b(){this._dispatcher=new c,this._bg=null,this._bgApi=null,this._isBackground=null,this._isVisible=null}var c=a("api/dispatcher"),d="__slice_visible_state",e={CHROME:"chrome",YABROWSER:"yabrowser",OPERA:"opera",CHROMIUM:"chromium",FIREFOX:"firefox",userAgent:window.navigator.userAgent,vendor:window.navigator.vendor,appVersion:window.navigator.appVersion,isChrome:function(){return/Google Inc/.test(this.vendor)&&/Chrome/.test(this.userAgent)&&!/MRCHROME|Comodo/.test(this.userAgent)},isYabrowser:function(){return/YaBrowser/.test(this.appVersion)},isOpera:function(){return/OPR\//.test(this.appVersion)},isFirefox:function(){return/Gecko\/[\d.]* Firefox\/[\d.]*/.test(this.userAgent)},get:function(){return this.isFirefox()?this.FIREFOX:this.isOpera()?this.OPERA:this.isYabrowser()?this.YABROWSER:this.isChrome()?this.CHROME:this.CHROMIUM}};return b.prototype={constructor:b,browser:e.get(),adapterType:"chrome",init:function(a){if(this.isUnsupported=!this._isSupport(),this.isUnsupported)return a();this._storageEventHandler=this._storageEventHandler.bind(this),this._helperPlatformListener=this._helperPlatformListener.bind(this),chrome.runtime.getBackgroundPage(this._initializePage.bind(this,a))},_initializePage:function(a,b){b&&(this._bg=b,this._bgApi=this._bg.api,this._isBackground=this._bg===window,this._isVisible=!this._isBackground,chrome.runtime.onMessage.addListener(this._helperPlatformListener),this._isBackground&&this._initBgApi(),a())},_initBgApi:function(){window.addEventListener("storage",this._storageEventHandler),this._bgApi.init(this)},getProductInfo:function(){var a=chrome.runtime.getManifest().version,b=a.split(".");return b&&b.length>2&&(a=b[0]+"."+b[1]),{version:a}},sendMessage:function(a,b,c,d){this.isUnsupported||(c&&d&&(c=c.bind(d)),this._notifyAllInThisContext(a,b,c),this._sendMessageToOtherAdapters(a,b,c))},sendOuterMessage:function(a,b,c,d){this.sendMessage(a,b,c,d)},_sendMessageToOtherAdapters:function(a,b,c){var d={topic:a,data:b,options:this._createMessageOptions()};chrome.runtime.sendMessage(d,c)},_helperPlatformListener:function(a,b,c){if(this._isMessageFromSlice(a)&&!this._isMessageFromSameContext(a)){var d=a.topic||a.message||a,e=a.data;this._notifyAllInThisContext(d,e,c)}},_notifyAllInThisContext:function(a,b,c){this._dispatcher.notifyAsync(a,b,c),this._isBackground&&this._bgApi.notifyNano(a,b,c)},_isMessageFromSlice:function(a){return a&&a.options&&a.options.fromSlice},_isMessageFromSameContext:function(a){return a&&a.options&&a.options.isBackground===this._isBackground},_createMessageOptions:function(){return{fromSlice:!0,isBackground:this._isBackground}},addListener:function(a,b,c){return this._dispatcher.addListener(a,b,c)},removeListener:function(a,b,c){this._dispatcher.removeListener(a,b,c)},notifyAsync:function(a,b,c){this._dispatcher.notifyAsync(a,b,c)},getOption:function(a){return this._bgApi.options.get(a)},setOption:function(a,b){return this._bgApi.options.set(a,b)},getLang:function(){return this._bgApi.i18n.locale},getBrandId:function(){return this._bgApi.branding.getId()},getUI:function(){return this._bgApi.config.getUI()},log:function(a){this._bgApi&&this._bgApi.logger.log(a)},error:function(a){this._bgApi&&this._bgApi.logger.error(a)},logObj:function(a,b){b&&console.log(b+":"),console.log(a)},getCookie:function(a,b,c,d,e,f,g){this._bgApi.cookie.get(a,b,c,d,f,g)},getString:function(a){return this._bgApi.i18n.getString(a)},openSettings:function(){this._bgApi.openSettings()},navigate:function(a,b){this._bgApi.navigate(a,b),e.isFirefox()&&window.setTimeout(function(){window.close()},0)},createXHR:function(){return new this._bg.XMLHttpRequest},resizeWindowTo:function(a,b){},isWindowVisible:function(){return this._isVisible},clear:function(){this._storageEventHandler&&(window.removeEventListener("storage",this._storageEventHandler),this._storageEventHandler=null),this._helperPlatformListener&&(chrome.runtime.onMessage.removeListener(this._helperPlatformListener),this._helperPlatformListener=null,this._isBackground||localStorage.setItem(d,"0"))},initSliceShowEvent:function(){this._isBackground||localStorage.setItem(d,"1")},getNotificationManager:function(){return this._bgApi.notify},getSlicePath:function(){return chrome.extension.getURL("slice/")},getCurrentTabUrl:function(a){this._bgApi.getCurrentTabUrl(a)},isCurrentWindowMinimized:function(a){this._bgApi.isCurrentWindowMinimized(a)},getWebSocket:function(){return this._bg.WebSocket},sendClickerStatistics:function(a){return this._bgApi.sendClickerStatistics(a),!0},setWindowStyle:function(a){},_isSupport:function(){return chrome&&chrome.runtime&&chrome.runtime.getBackgroundPage&&chrome.runtime.onMessage},_storageEventHandler:function(a){if(a.key===d){var b="1"===a.newValue;b!==this._isVisible&&(this._isVisible=b,this.sendMessage("slice-event-"+(b?"show":"hide")))}}},new b}),define("api/messages",["browser-adapter"],function(a){return{addListeners:function(b){if(b&&b.observers)for(var c in b.observers)b.observers.hasOwnProperty(c)&&"function"==typeof b.observers[c]&&a.addListener(c,b.observers[c],b)},removeListeners:function(b){if(b&&b.observers)for(var c in b.observers)b.observers.hasOwnProperty(c)&&"function"==typeof b.observers[c]&&a.removeListener(c,b.observers[c],b)}}}),define("api/manager",["browser-adapter","api/dispatcher","api/messages"],function(a,b,c){var d={};return d.onReady=function(){function e(){function b(){var a=f;f=null,a.notify("ready")}g?window.onload=null:document.removeEventListener("DOMContentLoaded",e,!1),a.init?a.init(b):b()}var f=new b,g=/MSIE\s+8/i.test(navigator.userAgent);return"loading"!==document.readyState?e():g?window.onload=e:document.addEventListener("DOMContentLoaded",e,!1),function(a,b){"function"!=typeof a&&(b=a,a=function(){"function"==typeof this.init&&!1===this.init()||(c.addListeners(this),"function"==typeof this.finalize&&d.onExit(this.finalize,this))}),f?f.addListener("ready",a,b):a.call(b)}}(),d.onExit=function(){function c(){d&&a&&(d.notify("exit"),d=null,a.clear(),a=null)}var d=new b;return window.onunload=c,window.onbeforeunload=c,function(a,b){d&&d.addListener("exit",a,b)}}(),d}),define("api/branding",["browser-adapter"],function(a){function b(){return a.getBrandId()}function c(){return a.browser}function d(){return a.adapterType}function e(){return a.getLang()}function f(a){return a&&"[object RegExp]"===Object.prototype.toString.call(a)}var g={domains:{ya:"yandex.ru",locale:{be:{ya:"yandex.by"},uk:{ya:"yandex.ua"},kk:{ya:"yandex.kz"}}},branding:{tb:{domains:{ya:"yandex.com.tr"}},ua:{domains:{ya:"yandex.ua"}}}},h=null,i={getDomain:function(a){return h||(h={notLocalized:i.brandingObject(g,!0,!1),full:i.brandingObject(g,!0)}),h[a?"full":"notLocalized"].domains.ya},_funcReplaceTLD:function(a,b){return i.getDomain(!!b)},brandingUrl:function(a){return a?a.replace(/\byandex\.\{tld((-kubr)?)\}/,i._funcReplaceTLD):""},brandingObject:function(a,g,h){function j(a,b,c,d,e){var f=a;if(d){if(!a[d])return b;if(f=a[d][e],"string"==typeof f&&(f=a[d][f]),g||delete a[d],!f)return b;f=k(f)}for(var h=Object.keys(f),i=0;i<h.length;++i){var j=h[i];c.hasOwnProperty(j)||o[j]||(c[j]=!0,b[j]=k(f[j]))}return b}function k(a){if("string"==typeof a)return i.brandingUrl(a);if(!a||!l&&!h&&!m||"object"!=typeof a)return a;if(f(a))return a;var b;if(Array.isArray(a)){b=g?[]:a;for(var c=0;c<a.length;++c)b[c]=k(a[c]);return b}var d={};return b=g?{}:a,j(a,b,d,"browser",m),j(a,b,d,"adapter",n),j(a,b,d,"branding",l),j(a,b,d,"locale",h),j(a,b,d)}var l=b();!1!==h&&(h=h||e());var m=c(),n=d(),o={browser:!0,locale:!0,branding:!0,adapter:!0};return k(a)}};return i}),define("api/stat",["browser-adapter"],function(a){function b(b){a.log("[api/stat]: "+b)}return{_statName:null,log:function(c){if(!a.sendClickerStatistics({cid:c.cid,param:c.param,statisticsId:this._statName})){var d=c.dtype,e=c.pid,f=c.cid,g=c.param;if(void 0===d&&(d="stred"),void 0===e&&(e=12),"string"!=typeof d)throw new TypeError("Invalid dtype type ('"+typeof d+"')");if(!d)throw new RangeError("dtype is empty string");if("number"!=typeof e)throw new TypeError("Wrong pid type ('"+typeof e+"'). Number required.");if(e<0)throw new RangeError("Invalid pid value ("+e+")");if("number"!=typeof f)throw new TypeError("Wrong cid type ('"+typeof f+"'). Number required.");if(f<=0)throw new RangeError("Invalid cid value ("+f+")");var h=a.getProductInfo();g=a.browser+"."+this._statName+"."+(h?h.version.replace(/\./g,"-")+".":"")+g;var i="https://clck.yandex.ru/click/dtype="+encodeURIComponent(d)+"/pid="+e+"/cid="+f+"/path="+encodeURIComponent(g),j="",k=["dtype","pid","cid","param"];for(var l in c)if(c.hasOwnProperty(l)&&-1===k.indexOf(l)){var m=c[l];"*"!==l?i+="/"+l+"="+encodeURIComponent(m):j=m}i+="/*"+j,b("stat log "+i);var n=a.createXHR();n.open("GET",i,!0),n.send()}},logWidget:function(a){this.log({cid:72359,param:a})},logNotification:function(a){this.log({cid:72358,param:a})},setStatName:function(a){this._statName=a||null}}}),define("slice/locale",[],function(){return{be:{addmail:"Далучыць іншую скрыню","addmail.desc":"вы заўсёды зможаце ў наладах пошты",attach:"З укладаннем",continuewm:"Працягваць работу з поштай",create:"Напісаць",delete:"Выдаліць","error.net":"Няма далучэння да інтэрнета","error.refresh":"Падчас абнаўлення адбылася памылка","ft.unread":"Непрачытаныя",login_other:"Увайсці ў іншую паштовую скрыню",logo:"Яндекс.Пошта",logout:"Выхад",logout_all:"Выйсці з усіх скрыняў","mail.wait":"Секундачку...",mails:"Далучаныя паштовыя скрыні","month.g1":"студзеня","month.g10":"кастрычніка","month.g11":"лістапада","month.g12":"снежня","month.g2":"лютага","month.g3":"сакавіка","month.g4":"красавіка","month.g5":"траўня","month.g6":"чэрвеня","month.g7":"ліпеня","month.g8":"жніўня","month.g9":"верасня",nounread:"Новых лістоў няма",refresh:"Абнавіць",retry:"Паспрабуйце яшчэ раз",setreaded:"Пазначыць як прачытанае",settings:"Наладкі віджэта",spam:"Пазначыць як спам",total:"усяго <i18n:param>count</i18n:param>","tt.create":"Напісаць новы ліст","tt.logo":"Перайсці ў Я.Пошту","tt.refresh":"Абнавіць спіс лістоў",wait:"Секундачку...",inbox:"Уваходныя",markasread:"Прачытана",markasspam:"Гэта спам!",reply:"Адказаць","new-messages-plural":"{N} новае паведамленне;{N} новыя паведамленні;{N} новых паведамленняў",hide:"Скрыть",show:"Показать",login:"Увайсці",logout1:"Выйсці"},en:{addmail:"You can always add another mailbox","addmail.desc":"in the mail settings menu",attach:"With attachment",continuewm:"Continue managing your mail",create:"Compose",delete:"Remove","error.net":"No internet connection","error.refresh":"An error occurred while updating","ft.unread":"Unread",login_other:"Log in to another account",logo:"Yandex.Mail",logout:"Log out",logout_all:"Log out of all mail accounts","mail.wait":"Just a sec...",mails:"Mailboxes","month.g1":"January","month.g10":"October","month.g11":"November","month.g12":"December","month.g2":"February","month.g3":"March","month.g4":"April","month.g5":"May","month.g6":"June","month.g7":"July","month.g8":"August","month.g9":"September",nounread:"You have no new messages",refresh:"Update",retry:"Try again",setreaded:"Mark as read",settings:"Widget settings",spam:"Mark as spam",total:"<i18n:param>count</i18n:param> in total","tt.create":"Compose message","tt.logo":"Go to Yandex.Mail","tt.refresh":"Refresh message list",wait:"Please wait...",inbox:"Inbox",markasread:"Mark as read",markasspam:"Spam!",reply:"Reply","new-messages-plural":"{N} new message;{N} new messages;{N} new messages",hide:"Скрыть",show:"Показать",login:"Log in",logout1:"Log out"},kk:{addmail:"Басқа жәшікті қосу","addmail.desc":"сіз әрдайым пошта баптауларынан таба аласыз",attach:"Тіркемелері бар",continuewm:"Поштамен жұмысты жалғастыру",create:"Жазу",delete:"Жою","error.net":"Интернетке қосылыс жоқ","error.refresh":"Жаңарту барысында қате кетті","ft.unread":"Оқылмағандар",login_other:"Басқа пошта жәшігіне кіру",logo:"Яндекс.Пошта",logout:"Шығу",logout_all:"Барлық жәшіктен шығу","mail.wait":"Бір сәт күтіңіз...",mails:"Кірістірілген пошта жәшіктері","month.g1":"қаңтар","month.g10":"қазан","month.g11":"қараша","month.g12":"желтоқсан","month.g2":"ақпан","month.g3":"наурыз","month.g4":"сәуір","month.g5":"мамыр","month.g6":"маусым","month.g7":"шілде","month.g8":"тамыз","month.g9":"қыркүйек",nounread:"Жаңа хат жоқ",refresh:"Жаңарту",retry:"Тағы сынап көріңіз",setreaded:"Оқылған деп белгілеу",settings:"Виджеттің баптаулары",spam:"Спам деп белгілеу",total:"барлығы <i18n:param>count</i18n:param>","tt.create":"Жаңа хат жазу","tt.logo":"Я.Поштаға өту","tt.refresh":"Хаттар тізімін жаңарту",wait:"Бір сәт күтіңіз...",inbox:"Кіріс",markasread:"Оқылған",markasspam:"Бұл спам!",reply:"Жауап беру","new-messages-plural":"{N} жаңа хабарлама;{N} жаңа хабарлама;{N} жаңа хабарлама",hide:"Скрыть",show:"Показать",login:"Войти",logout1:"Выйти"},ru:{addmail:"Подключить другой ящик","addmail.desc":"вы всегда сможете в настройках почты",attach:"С вложением",continuewm:"Продолжить работу с почтой",create:"Написать",delete:"Удалить",reply:"Ответить","error.net":"Нет подключения к интернету","error.refresh":"При обновлении произошла ошибка","ft.unread":"Непрочитанные",login_other:"Войти в другой почтовый ящик",logo:"Яндекс.Почта",logout:"Выход",logout_all:"Выйти из всех ящиков","mail.wait":"Секундочку...",mails:"Подключенные почтовые ящики","month.g1":"января","month.g10":"октября","month.g11":"ноября","month.g12":"декабря","month.g2":"февраля","month.g3":"марта","month.g4":"апреля","month.g5":"мая","month.g6":"июня","month.g7":"июля","month.g8":"августа","month.g9":"сентября",nounread:"Новых писем нет",refresh:"Обновить",retry:"Попробуйте еще раз",setreaded:"Отметить как прочитанное",markasread:"Прочитано",settings:"Настройки виджета",spam:"Отметить как спам",markasspam:"Это спам!",total:"всего <i18n:param>count</i18n:param>","tt.create":"Написать новое письмо","tt.logo":"Перейти в Я.Почту","tt.refresh":"Обновить список писем",wait:"Секундочку...",inbox:"Входящие","new-messages-plural":"{N} новое сообщение;{N} новых сообщения;{N} новых сообщений",hide:"Скрыть",show:"Показать",login:"Войти",logout1:"Выйти"},tr:{addmail:"Başka e-posta hesabı bağla","addmail.desc":"mail ayarlarından her zaman yapılabilir",attach:"Ekli ",continuewm:"Mail'i kullanmaya devam et",create:"E-posta yaz ",delete:"Sil ","error.net":"İnternet bağlantısı yok","error.refresh":"Güncelleme sırasında hata oluştu","ft.unread":"Okunmamış ",login_other:"Diğer hesaba giriş yap",logo:"Yandex.Mail",logout:"Çıkış ",logout_all:"Tüm hesaplardan çıkış yap","mail.wait":"Bekleyin...",mails:"Bağlı e-posta hesapları","month.g1":"Ocak","month.g10":"Ekim","month.g11":"Kasım","month.g12":"Aralık","month.g2":"Şubat","month.g3":"Mart","month.g4":"Nisan","month.g5":"Mayıs","month.g6":"Haziran","month.g7":"Temmuz","month.g8":"Ağustos","month.g9":"Eylül",nounread:"Yeni e-posta yok",refresh:"Güncelle ",retry:"Tekrar deneyin",setreaded:"Okundu olarak işaretle",settings:"Widget ayarları ",spam:"Spam olarak işaretle",total:"toplam <i18n:param>count</i18n:param>","tt.create":"E-posta yaz","tt.logo":"Yandex.Mail'e git","tt.refresh":"Mesaj listesini güncelle",wait:"Lütfen bekleyin... ",inbox:"Gelen Kutusu",markasread:"Okunmuş",markasspam:"Spam!",reply:"Yanıtla","new-messages-plural":"{N} yeni mesaj;{N} yeni mesaj;{N} yeni mesaj",hide:"Gizle",show:"Göster",login:"Giriş yap",logout1:"Çıkış yap"},uk:{addmail:"Підключити іншу скриньку","addmail.desc":"ви завжди зможете в налаштуваннях пошти",attach:"Із вкладенням",continuewm:"Продовжити роботу з поштою",create:"Написати",delete:"Видалити","error.net":"Немає підключення до інтернету","error.refresh":"Під час оновлення сталася помилка","ft.unread":"Непрочитані",login_other:"Увійти в іншу поштову скриньку",logo:"Яндекс.Пошта",logout:"Вихід",logout_all:"Вийти з усіх скриньок","mail.wait":"Секундочку...",mails:"Підключені поштові скриньки","month.g1":"cічня","month.g10":"жовтня","month.g11":"листопада","month.g12":"грудня","month.g2":"лютого","month.g3":"березня","month.g4":"квітня","month.g5":"травня","month.g6":"червня","month.g7":"липня","month.g8":"серпня","month.g9":"вересня",nounread:"Нових листів немає",refresh:"Оновити",retry:"Спробуйте ще раз",setreaded:"Позначити як прочитане",settings:"Налаштування віджета",spam:"Позначити як спам",total:"всього <i18n:param>count</i18n:param>","tt.create":"Написати новий лист","tt.logo":"Перейти у Я.Пошту","tt.refresh":"Оновити список листів",wait:"Секундочку...",inbox:"Вхідні",markasread:"Прочитано",markasspam:"Це спам!",reply:"Відповісти","new-messages-plural":"{N} нове повідомлення;{N} нові повідомлення;{N} нових повідомлень",hide:"Приховати",show:"Показати",login:"Увійти",logout1:"Вийти"}}}),define("slice/logic/config",{statName:"yamail",URL_WEB:"https://mail.yandex.{tld-kubr}/",URL_COUNTER:"https://export.{passport}/for/counters.xml",URL_API:"https://mail.yandex.ru/api/",URL_COUNTERS_ALL:"https://mail.yandex.ru/api/v2/bar/counters?silent&multi",OAUTH:{CLIENT_ID:"49c545918c574ac28dd7d27e8297065a",CLIENT_SECRET:"813caaea334a4fb5be54a8b9af3f4c97"},UPDATE_TIME_MS:3e5,MESSAGES_TO_LOAD:40,MESSAGES_TO_DISPLAY:20,IGNORED_FOLDERS:["spam","archive","trash","sent","outbox","draft"],XIVA_RECONNECT_TIMEOUT_MS:6e4,XIVA_RECONNECT_MAX_TIMEOUT_MS:192e4,XIVA_PING_RECONNECT_TIMEOUT_MS:12e4,linkParam:"elmt=mail",LOGO_LANG:"ru",locale:{en:{LOGO_LANG:"en"},tr:{LOGO_LANG:"en"},uk:{LOGO_LANG:"uk"},be:{LOGO_LANG:"uk"},kk:{LOGO_LANG:"uk"}},branding:{tb:{LOGO_LANG:"en",URL_WEB:"https://mail.yandex.com.tr/",URL_COUNTERS_ALL:"https://mail.yandex.com.tr/api/v2/bar/counters?silent&multi",URL_API:"https://mail.yandex.com.tr/api/"},ua:{URL_WEB:"https://mail.yandex.ua/"}},adapter:{chrome:{linkParam:"origin=elmt_mailchrome"}}}),define("slice/adapter/main",["browser-adapter","api/manager","api/branding","api/stat","slice/locale","slice/logic/config"],function(a,b,c,d,e,f){b.onReady(function(){if(c.brandingObject(f),d.setStatName(f.statName),e&&void 0!==e.ru){var b=e[a.getLang()]||e.ru;a.getString=function(a,c){var d=b[a]||"";return d&&c?d.replace(/<i18n:param>([a-zA-Z0-9\._-]+)<\/i18n:param>/g,function(a,b){return c[b]}):d}}"function"==typeof jQuery&&jQuery.ajaxSetup({crossDomain:!1,xhr:function(){return a.createXHR()}})})}),define("api/dom",[],function(){function a(a){return String(a).replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")}function b(b){return new RegExp("(^|\\s)"+a(b)+"(\\s|$)")}function c(a,b){for(var c=a.target||a.srcElement,d={self:b,target:c,event:a};c&&(!d.parent&&c.getAttribute("data-cmd-parent")&&(d.parent=c),d.param=d.param||c.getAttribute("data-cmd-param")||"",d.command=d.command||c.getAttribute("data-command")||"",c!=b);)c=c.parentNode;return d}return{getClickHandler:function(a){return function(b){b=b||window.event;var d=c(b,this);if(a.commands&&d.command&&a.commands[d.command])return b.stopPropagation?b.stopPropagation():b.cancelBubble=!0,a.commands[d.command].call(a,d)}},addClass:function(b,c){if(b&&c){if(b.classList)return void b.classList.add(c);var d=new RegExp("^(?!.*(^|\\s)"+a(c)+"(\\s|$))");b.className=b.className.replace(d,c+" ").trim()}},removeClass:function(a,c){if(a&&c){if(a.classList)return void a.classList.remove(c);var d=b(c);a.className=a.className.replace(d," ").trim()}},toggleClass:function(a,b){return!(!a||!b)&&(a.classList?a.classList.toggle(b):void(this.hasClass(a,b)?this.removeClass(a,b):this.addClass(a,b)))},hasClass:function(a,c){return!(!a||!c)&&(a.classList?a.classList.contains(c):b(c).test(a.className))},dragNDropCore:function(a){function b(b){if(e)return e.oldX=e.pageX,e.oldY=e.pageY,e.pageX=b.pageX,e.pageY=b.pageY,a.onmove.call(a.ctx,e,b),!1}function c(d){if(e)return document.removeEventListener("mousemove",b,!1),document.removeEventListener("mouseup",c,!1),a.onstop&&a.onstop.call(a.ctx,e,d),e=null,!1}function d(d){return c(),e={elem:this,target:d.target,startX:d.pageX,startY:d.pageY,pageX:d.pageX,pageY:d.pageY},a.start&&!1===a.start.call(a.ctx,e,d)?void(e=null):(document.addEventListener("mousemove",b,!1),document.addEventListener("mouseup",c,!1),d.stopPropagation(),d.preventDefault(),!1)}var e=null;if(a.elems.tagName)a.elems.addEventListener("mousedown",d,!1);else for(var f=0;f<a.elems.length;++f)a.elems[f].addEventListener("mousedown",d,!1)}}}),define("api/utils",["browser-adapter"],function(a){return{copy:function(a,b){if(b=b||{},a)for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b},emptyFunc:function(){},navigate:function(b,c){if(b){var d=c&&c.shiftKey?"new window":"new tab";c&&(c.preventDefault?c.preventDefault():c.returnValue=!1),a.navigate(b,d)}},getParam:function(a,b){return(RegExp("[?&]"+a+"=([^&#]*)","i").exec(b||document.location.href)||"")[1]||""},debounce:function(a,b,c){var d;return function(){var e=this,f=arguments,g=function(){d=null,c||a.apply(e,f)},h=c&&!d;clearTimeout(d),d=setTimeout(g,b),h&&a.apply(e,f)}}}}),define("api/http",["browser-adapter","api/utils"],function(a,b){function c(a,b){return a+"="+encodeURIComponent(b)}function d(a,b){return'Content-Disposition: form-data; name="'+a+'"\r\n\r\n'+b}function e(a,b){if(!a||"string"==typeof a)return a||"";var e=[],f=b?d:c;for(var g in a)if(a.hasOwnProperty(g)){var h=a[g];Array.isArray(h)?h.forEach(function(a){e.push(f(g,a))}):e.push(f(g,h))}if(b){var i="\r\n";return b+i+e.join(i+b+i)+i+b+"--"+i}return e.join("&")}function f(c){var d=a.createXHR(),f=c.multipart?"-----8a7gadg1ahSDCV"+Date.now():null,g=c.url,h=null,i=e(c.query),j=e(c.params,f?"--"+f:null);if(c.data&&(i=i||j,j=""),"POST"===c.method?h=c.data||j||"":(h=c.data||null,i=i||j),i&&(g+=(-1===g.indexOf("?")?"?":"&")+i),d.open(c.method,g,!c.sync),c.overrideMimeType&&d.overrideMimeType&&d.overrideMimeType(c.overrideMimeType),c.background)try{d.mozBackgroundRequest=!0}catch(a){}var k=b.copy(c.headers);if(!k["Content-Type"]){var l=c.contentType;l||"POST"!=c.method||(l=f?"multipart/form-data; boundary="+f:"application/x-www-form-urlencoded;  charset=UTF-8"),l&&(k["Content-Type"]=l)}for(var m in k)k.hasOwnProperty(m)&&d.setRequestHeader(m,k[m]);return{xhr:d,text:h}}function g(a,b){if("xml"==b){var c=a.responseXML;if(c)return c;throw"parse error"}var d=a.responseText;return"json"==b&&(d=JSON.parse(d)),d}function h(a){function c(b){d.xhr&&!d.aborted&&(d.aborted=b||"abort",d.xhr.abort(),i.call(j,0,d.aborted,d.xhr,a))}var d=f(a);if(!a.sync){var e=a.end||b.emptyFunc,h=a.callback||b.emptyFunc,i=a.errback||b.emptyFunc,j=a.ctx||a.scope||a,k=Date.now();d.xhr.onreadystatechange=function(){if(d.xhr&&4==d.xhr.readyState){var b=Date.now();if(e.call(j,d.xhr),d.timer&&(clearTimeout(d.timer),d.timer=null),!d.aborted){var c=d.xhr.status,f="error";if(c>=200&&c<400){var l="",m=!1;if("HEAD"===a.method)h.call(j,null,d.xhr,c,n);else{try{l=g(d.xhr,a.responseType),m=!0}catch(b){i.call(j,500,"parse error",d.xhr,a)}if(m){var n=null;if(a.getTimeDiff){var o=new Date(d.xhr.getResponseHeader("Date")).valueOf();n=o?Math.round((k+b)/2)-o:null}h.call(j,l,d.xhr,c,n)}}}else{try{f=d.xhr.statusText}catch(a){}i.call(j,c,f,d.xhr,a)}}d.xhr=null}}}if(d.xhr.send(d.text),a.sync)try{return g(d.xhr,a.responseType)}catch(a){return null}return a.timeout&&a.timeout>0&&(d.timer=setTimeout(function(){d.timer&&c("timeout")},a.timeout)),{abort:c}}return{HEAD:function(a){return a.method="HEAD",h(a)},GET:function(a){if(a.method="GET",a.noCache){var b=a.query||a.params||{};"string"==typeof b?b=b+"&_randomparameter="+Date.now():b._randomparameter=Date.now(),a.params?a.params=b:a.query=b}return h(a)},POST:function(a){return a.method="POST",h(a)},PATCH:function(a){return a.method="PATCH",h(a)},PUT:function(a){return a.method="PUT",h(a)}}}),define("api/xml",[],function(){var a=/&|  |<|>|\r\n|\n|"/g,b=/&amp;|&nbsp;|&lt;|&gt;|<(br|BR)\s*\/?>|&quot;/g,c={"&":"&amp;","  ":"&nbsp; ","<":"&lt;",">":"&gt;","\n":"<br />","\r\n":"<br />",'"':"&quot;"},d={"&amp;":"&","&nbsp;":" ","&lt;":"<","&gt;":">","<br />":"\n","<br/>":"\n","<br>":"\n","&quot;":'"'},e=function(a){return c[a]},f=function(a){return d[a.toLowerCase()]},g={escape:function(b){return b?String(b).replace(a,e):""},unescape:function(a){return a?String(a).replace(b,f):""},stringToXml:function(a){var b;return"function"==typeof DOMParser?b=(new DOMParser).parseFromString(a,"text/xml"):"function"==typeof ActiveXObject&&(b=new ActiveXObject("Microsoft.XMLDOM"),b.async=!1,b.loadXML(a)),b},select:function(a,b){return b=b||document,"function"==typeof Sizzle?Sizzle(a,b)[0]||null:b.querySelector(a)},selectAll:function(a,b){return b=b||document,"function"==typeof Sizzle?Sizzle(a,b):b.querySelectorAll(a)},getText:function(a,b){return a&&b&&(a=g.select(b,a)),a?a.textContent||a.innerText||a.firstChild&&a.firstChild.data||"":""},setText:function(a,b){a&&(a.textContent=b,a.innerText=b)},getAttr:function(a,b,c){return 2==arguments.length&&(c=b,b=null),a&&b&&(a=g.select(b,a)),a&&a.getAttribute(c)||""}};return g});