(() => {
  'use strict';
  const root = document.getElementById('wow-class-page');
  if (!root) return;

  const classKey = root.dataset.wowClass;
  const copy = {
    loading: ['Loading the class playbook…', 'Laster klassespillboken …'],
    loadError: ['The class reference could not load. Please refresh the page.', 'Klassereferansen kunne ikke lastes. Oppdater siden.'],
    back: ['Gaming overview', 'Gamingoversikt'],
    eyebrow: ['WORLD OF WARCRAFT / PVP REFERENCE', 'WORLD OF WARCRAFT / PVP-REFERANSE'],
    titleTail: ['PvP playbook', 'PvP-spillbok'],
    intro: ['A class-by-class reference for Classic and Forever. Gear and macros will be added as Thomalex’s lists are ready.', 'En klassevis referanse for Classic og Forever. Gear og macros legges til når Thomalex sine lister er klare.'],
    classNav: ['Explore classes', 'Utforsk klasser'],
    onPage: ['ON THIS PAGE', 'PÅ DENNE SIDEN'],
    jumpGear: ['Gear plans', 'Gear-oppsett'],
    jumpSituational: ['Situational gear', 'Situasjonsutstyr'],
    jumpConsumables: ['Consumables', 'Forbruksvarer'],
    jumpMacros: ['Macros', 'Macros'],
    versionLabel: ['Choose game version', 'Velg spillversjon'],
    classic: ['Classic', 'Classic'],
    forever: ['Forever', 'Forever'],
    buildEyebrow: ['01 / BEST-IN-SLOT PLANS', '01 / BEST-IN-SLOT-OPPSETT'],
    buildTitle: ['Build the set around the fight.', 'Bygg oppsettet etter kampen.'],
    buildIntro: ['Two separate PvP sets for each version. Every listed item will link to its exact Wowhead database page.', 'To separate PvP-oppsett for hver versjon. Hvert oppført item lenkes til sin egen Wowhead-databaseside.'],
    setOpen: ['Open-world PvP', 'World PvP'],
    setBg: ['Battlegrounds', 'Battlegrounds'],
    bis: ['Best in slot', 'Best in slot'],
    gearWaiting: ['The gear list is ready for your item choices.', 'Gear-listen er klar for item-valgene dine.'],
    slots: ['Gear slots', 'Gear-slots'],
    showSlots: ['Show all {count} slots', 'Vis alle {count} slots'],
    slotsCount: ['{filled} of {total} items linked', '{filled} av {total} items lenket'],
    slotEmpty: ['Coming soon', 'Kommer snart'],
    itemNeedsLink: ['Item hidden until its exact Wowhead link is added.', 'Item vises når den eksakte Wowhead-lenken er lagt til.'],
    openPlanner: ['Open planner', 'Åpne planner'],
    editPlanner: ['Open saved set', 'Åpne lagret oppsett'],
    createPlanner: ['Start a set in {provider}', 'Start et oppsett i {provider}'],
    plannerHint: ['Planner link coming soon.', 'Planner-lenke kommer snart.'],
    comingSoon: ['Coming soon', 'Kommer snart'],
    slotsEmpty: ['Coming soon · 0 of {total} items linked', 'Kommer snart · 0 av {total} items lenket'],
    macroPlaceholderTitle: ['{category} macros', 'Macros for {category}'],
    macroComingSoon: ['Coming soon. This section is ready for your macros.', 'Kommer snart. Denne delen er klar for macroene dine.'],

    plannerTitle: ['Interactive gear planner', 'Interaktiv gear-planner'],
    modelTitle: ['3D character preview', '3D-karaktervisning'],
    modelHint: ['3D preview coming soon.', '3D-visning kommer snart.'],
    modelOpen: ['Open 3D preview', 'Åpne 3D-visning'],
    modelFrame: ['Interactive 3D character preview', 'Interaktiv 3D-karaktervisning'],
    itemLinkLabel: ['Open {item} in the Wowhead database (opens in a new tab)', 'Åpne {item} i Wowhead-databasen (åpnes i en ny fane)'],
    itemSite: ['Wowhead item page', 'Wowhead-itemside'],
    situationalEyebrow: ['02 / MATCHUP NOTES', '02 / MATCHUP-NOTATER'],
    situationalTitle: ['The useful exceptions.', 'De nyttige unntakene.'],
    situationalIntro: ['Situational and niche pieces, organized by gear slot with the matchup or reason each item is worth carrying.', 'Situasjons- og niche-items, sortert etter gear-slot med matchup eller grunn til at itemet er nyttig.'],
    situationalEmpty: ['Slot-by-slot recommendations coming soon.', 'Anbefalinger for hvert slot kommer snart.'],
    situationalSlotEmpty: ['Coming soon', 'Kommer snart'],
    noSituational: ['No items listed', 'Ingen items oppført'],
    consumablesEyebrow: ['03 / PREPARATION', '03 / FORBEREDELSER'],
    consumablesTitle: ['What to carry.', 'Dette bør du ha med.'],
    consumablesIntro: ['Class-specific consumables will be grouped by use and linked to their item pages.', 'Klassetilpassede forbruksvarer grupperes etter bruk og lenkes til itemsidene sine.'],
    consumablesEmpty: ['Consumables coming soon.', 'Forbruksvarer kommer snart.'],
    macrosEyebrow: ['04 / MACRO LIBRARY', '04 / MACRO-BIBLIOTEK'],
    macrosTitle: ['Built for your binds.', 'Tilpasset keybindsene dine.'],
    macrosIntro: ['Each category is set up and ready. Every macro will have a title, category, and one-click copy button.', 'Hver kategori er klar. Hver macro får en tittel, kategori og kopieringsknapp.'],
    filterLabel: ['Filter macros', 'Filtrer macros'],
    allMacros: ['All', 'Alle'],
    pvp: ['PvP', 'PvP'],
    class: ['Class', 'Klasse'],
    qualityOfLife: ['Quality of life', 'Quality of life'],
    niche: ['Niche', 'Niche'],
    macroEmpty: ['Macros coming soon.', 'Macros kommer snart.'],
    macroCode: ['Macro text', 'Macro-tekst'],
    copyMacro: ['Copy macro', 'Kopier macro'],
    copied: ['Macro copied.', 'Macro kopiert.'],
    copyFailed: ['Copy was unavailable. Select and copy the macro text.', 'Kopiering var ikke tilgjengelig. Marker og kopier macro-teksten.'],
    macroNote: ['When to use it', 'Når den brukes'],
    footerHint: ['Need a tailored setup? Add thmlx on Discord.', 'Trenger du et tilpasset oppsett? Legg til thmlx på Discord.']
  };
  const tr = (key, values = {}) => {
    const language = window.siteI18n?.lang === 'nb' ? 1 : 0;
    let value = copy[key]?.[language] ?? copy[key]?.[0] ?? key;
    for (const [name, replacement] of Object.entries(values)) value = value.replaceAll('{' + name + '}', String(replacement));
    return value;
  };
  const el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined && content !== null) node.textContent = String(content);
    return node;
  };
  const icon = (name, className = 'ui-icon') => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(ns, 'use');
    use.setAttribute('href', '/assets/ui-icons.svg?v=2#' + name);
    svg.append(use);
    return svg;
  };
  const isExternalHttps = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && (url.hostname === 'wowhead.com' || url.hostname.endsWith('.wowhead.com') || url.hostname === 'sixtyupgrades.com' || url.hostname.endsWith('.sixtyupgrades.com'));
    } catch { return false; }
  };
  const safeLink = (url, label, className) => {
    if (!url || !isExternalHttps(url)) return null;
    const link = el('a', className, label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  };
  const slotDefs = [
    ['head','Head'],['neck','Neck'],['shoulders','Shoulders'],['back','Back'],['chest','Chest'],
    ['shirt','Shirt'],['tabard','Tabard'],['wrists','Wrists'],['hands','Hands'],['waist','Waist'],
    ['legs','Legs'],['feet','Feet'],['finger1','Ring 1'],['finger2','Ring 2'],['trinket1','Trinket 1'],
    ['trinket2','Trinket 2'],['mainHand','Main hand'],['offHand','Off hand'],['ranged','Ranged']
  ];
  const classNames = ['hunter','warrior','rogue','druid'];
  let library = null;
  let activeVersion = new URLSearchParams(location.search).get('version') === 'classic' ? 'classic' : 'forever';
  let activeMacroFilter = 'all';

  function paragraph(cls, value) { return el('p', cls, value); }
  function addSectionLabel(parent, index, label) {
    const node = el('p', 'eyebrow', index + ' / ' + label);
    parent.append(node);
    return node;
  }
  function createRoot() {
    root.replaceChildren();
    root.setAttribute('aria-busy', 'false');
    const item = library.classes[classKey];
    const hero = el('section','wow-class-hero wrap');
    const back = el('a','back-link',tr('back'));
    back.href='/gaming/';
    back.prepend(icon('arrow-left'));
    hero.append(back);
    hero.append(el('p','eyebrow',tr('eyebrow')));
    const heading=el('h1','wow-class-title');
    heading.id='class-title';
    heading.append(document.createTextNode(item.name + '.'));
    heading.append(document.createElement('br'));
    const tail=el('em','',tr('titleTail'));
    heading.append(tail);
    hero.append(heading);
    hero.append(paragraph('wow-class-lead', item.style[window.siteI18n?.lang === 'nb' ? 'nb' : 'en']));
    hero.append(paragraph('wow-class-intro',tr('intro')));
    const nav=el('nav','class-switch');
    nav.setAttribute('aria-label',tr('classNav'));
    nav.append(el('span','class-switch-label',tr('classNav')));
    for(const slug of classNames) {
      const c=library.classes[slug];
      const a=el('a',slug===classKey?'is-current':'',c.name);
      a.href='/gaming/'+slug+'/';
      if(slug===classKey) a.setAttribute('aria-current','page');
      nav.append(a);
    }
    hero.append(nav);
    root.append(hero);

    const jump=el('nav','class-page-jump wrap');
    jump.setAttribute('aria-label',tr('onPage'));
    jump.append(el('span','',tr('onPage')));
    [['loadouts','jumpGear'],['situational','jumpSituational'],['consumables','jumpConsumables'],['macros','jumpMacros']].forEach(([id,key])=>{
      const a=el('a','',tr(key));a.href='#'+id;jump.append(a);
    });
    root.append(jump);

    const controls=el('div','class-page-controls wrap');
    const versionGroup=el('div','version-switch');
    versionGroup.setAttribute('role','group');
    versionGroup.setAttribute('aria-label',tr('versionLabel'));
    for(const version of ['forever','classic']){
      const button=el('button','version-button',tr(version));
      button.type='button';
      button.dataset.version=version;
      button.setAttribute('aria-pressed',String(activeVersion===version));
      button.addEventListener('click',()=>{
        activeVersion=version;
        const u=new URL(location.href);
        u.searchParams.set('version',version);
        history.replaceState(null,'',u);
        activeMacroFilter='all';
        render();
        document.querySelector('[data-version="'+version+'"]')?.focus();
      });
      versionGroup.append(button);
    }
    controls.append(versionGroup);
    root.append(controls);
    const content=el('div','wrap class-library-content');
    content.id='class-library-content';
    root.append(content);
    root.append(paragraph('class-library-contact',tr('footerHint')));
    const contact=root.querySelector('.class-library-contact');
    const discord=el('a','',' Open Discord');
    discord.href='https://discord.com/channels/@me';
    discord.target='_blank';
    discord.rel='noopener noreferrer';
    contact.append(discord);
    const status=el('p','class-library-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(status);
    renderVersionContent();
  }

  function renderPlanCard(setKey, versionData, versionKey) {
    const setSchema=library.setTypes[setKey];
    const setData=versionData.sets?.[setKey] || {};
    const card=el('article','plan-card');
    const heading=el('div','plan-card-heading');
    heading.append(el('p','plan-card-kicker',tr('bis')));
    heading.append(el('h3','',tr(setKey==='openWorld'?'setOpen':'setBg')));
    card.append(heading);

    const plannerPanel=el('section','planner-panel');
    const panelHeading=el('h4','',tr('plannerTitle'));
    plannerPanel.append(panelHeading);
    const plannerUrl=setData.plannerUrl;
    if(plannerUrl && isExternalHttps(plannerUrl)){
      const iframe=document.createElement('iframe');
      iframe.src=plannerUrl;
      iframe.title=tr('plannerTitle')+' — '+library.classes[classKey].name+' '+tr(versionKey);
      iframe.loading='lazy';
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      iframe.allow='fullscreen';
      iframe.allowFullscreen=true;
      iframe.className='planner-frame';
      plannerPanel.append(iframe);
      const open=safeLink(plannerUrl,tr('editPlanner'),'planner-link');
      if(open){open.append(icon('arrow-up-right'));plannerPanel.append(open);}
    }else{
      plannerPanel.append(paragraph('planner-hint',tr('plannerHint')));
      const start=safeLink(library.versions[versionKey].plannerStartUrl,tr('createPlanner',{provider:library.versions[versionKey].provider}),'planner-link');
      if(start){start.append(icon('arrow-up-right'));plannerPanel.append(start);}
    }
    card.append(plannerPanel);

    const modelPanel=el('section','model-panel');
    const modelHeading=el('h4','',tr('modelTitle'));
    modelPanel.append(modelHeading);
    const modelUrl=setData.modelUrl;
    if(modelUrl && isExternalHttps(modelUrl)){
      const iframe=document.createElement('iframe');
      iframe.src=modelUrl;
      iframe.title=tr('modelFrame')+' — '+library.classes[classKey].name;
      iframe.loading='lazy';
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      iframe.allow='fullscreen';
      iframe.allowFullscreen=true;
      iframe.className='model-frame';
      modelPanel.append(iframe);
      const open=safeLink(modelUrl,tr('modelOpen'),'planner-link');
      if(open){open.append(icon('arrow-up-right'));modelPanel.append(open);}
    }else{
      modelPanel.append(paragraph('model-hint',tr('modelHint')));
    }
    card.append(modelPanel);

    const items=setData.items||{};
    const filled=slotDefs.filter(([key])=>items[key] && typeof items[key].name==='string' && isExternalHttps(items[key].wowheadUrl) && new URL(items[key].wowheadUrl).hostname.endsWith('wowhead.com')).length;
    const details=document.createElement('details');
    details.className='gear-slots-details';
    const summary=document.createElement('summary');
    summary.textContent=tr('showSlots',{count:slotDefs.length})+' · '+(filled ? tr('slotsCount',{filled,total:slotDefs.length}) : tr('slotsEmpty',{total:slotDefs.length}));
    details.append(summary);
    const slotGrid=el('div','gear-slot-grid');
    for(const [key,label] of slotDefs){
      const row=el('div','gear-slot-row');
      row.append(el('span','gear-slot-label',label));
      const entry=items[key];
      if(entry && typeof entry.name==='string' && isExternalHttps(entry.wowheadUrl) && new URL(entry.wowheadUrl).hostname.endsWith('wowhead.com')){
        const link=safeLink(entry.wowheadUrl,entry.name,'wowhead-item-link');
        link.setAttribute('aria-label',tr('itemLinkLabel',{item:entry.name}));
        link.append(icon('arrow-up-right'));
        row.append(link);
      }else if(entry && entry.name){
        row.append(el('span','gear-item-unlinked',tr('itemNeedsLink')));
      }else{
        row.append(el('span','gear-item-empty',tr('slotEmpty')));
      }
      slotGrid.append(row);
    }
    details.append(slotGrid);
    card.append(details);
    return card;
  }

  function appendItemRecord(parent, item, options={}) {
    if(!item || typeof item!=='object') return false;
    const name=typeof item.name==='string'?item.name.trim():'';
    const link=item.wowheadUrl;
    if(!name || !isExternalHttps(link) || !new URL(link).hostname.endsWith('wowhead.com')){
      if(name) parent.append(paragraph('gear-item-unlinked',tr('itemNeedsLink')));
      return false;
    }
    const a=safeLink(link,name,'wowhead-item-link');
    a.setAttribute('aria-label',tr('itemLinkLabel',{item:name}));
    a.append(icon('arrow-up-right'));
    parent.append(a);
    if(item.notes) parent.append(paragraph('item-note',item.notes));
    if(item.matchups) parent.append(paragraph('item-matchups',item.matchups));
    return true;
  }

  function renderSituational(versionData){
    const section=el('section','library-section');
    section.id='situational';
    section.setAttribute('aria-labelledby','situational-title');
    const heading=el('div','library-section-heading');
    addSectionLabel(heading,'02',tr('situationalEyebrow').replace(/^02 \/ /,''));
    const title=el('h2','',tr('situationalTitle'));title.id='situational-title';heading.append(title);
    heading.append(paragraph('',tr('situationalIntro')));
    section.append(heading);

    const gear=versionData.situationalGear||{};
    const all=slotDefs.flatMap(([key,label])=>(Array.isArray(gear[key])?gear[key]:[]).map(item=>({key,label,item})));
    const groups=el('div','situational-slots');
    for(const [key,label] of slotDefs){
      const matching=all.filter(entry=>entry.key===key);
      if(!matching.length){
        const row=el('div','situational-slot situational-slot-empty');
        row.append(el('span','gear-slot-label',label));
        row.append(el('span','gear-item-empty',tr('situationalSlotEmpty')));
        groups.append(row);
        continue;
      }
      const group=document.createElement('details');
      group.className='situational-slot';
      const sum=document.createElement('summary');
      sum.textContent=label+' · '+matching.length;
      group.append(sum);
      const list=el('div','situational-items');
      for(const record of matching) appendItemRecord(list,record.item);
      group.append(list);groups.append(group);
    }
    section.append(groups);
    return section;
  }

  function renderConsumables(versionData){
    const section=el('section','library-section');
    section.id='consumables';section.setAttribute('aria-labelledby','consumables-title');
    const heading=el('div','library-section-heading');
    addSectionLabel(heading,'03',tr('consumablesEyebrow').replace(/^03 \/ /,''));
    const title=el('h2','',tr('consumablesTitle'));title.id='consumables-title';heading.append(title);
    heading.append(paragraph('',tr('consumablesIntro')));section.append(heading);
    const records=Array.isArray(versionData.consumables)?versionData.consumables:[];
    const valid=records.filter(item=>item && typeof item.name==='string' && isExternalHttps(item.wowheadUrl) && new URL(item.wowheadUrl).hostname.endsWith('wowhead.com'));
    if(!valid.length){
      const placeholder=el('article','consumable-card consumable-placeholder');
      placeholder.append(paragraph('library-empty',tr('consumablesEmpty')));
      section.append(placeholder);return section;
    }
    const list=el('div','consumable-list');
    for(const item of valid){
      const card=el('article','consumable-card');
      if(item.category) card.append(el('span','consumable-category',item.category));
      appendItemRecord(card,item,{});
      list.append(card);
    }
    section.append(list);return section;
  }

  function renderMacros(versionData){
    const section=el('section','library-section macro-library');
    section.id='macros';section.setAttribute('aria-labelledby','macro-title');
    const heading=el('div','library-section-heading');
    addSectionLabel(heading,'04',tr('macrosEyebrow').replace(/^04 \/ /,''));
    const title=el('h2','',tr('macrosTitle'));title.id='macro-title';heading.append(title);
    heading.append(paragraph('',tr('macrosIntro')));section.append(heading);
    const categoryKeys=['all','pvp','class','qualityOfLife','niche'];
    const categories=categoryKeys.slice(1);
    const filter=el('div','macro-filters');
    filter.setAttribute('role','group');filter.setAttribute('aria-label',tr('filterLabel'));
    for(const key of categoryKeys){
      const button=el('button','macro-filter',tr(key==='all'?'allMacros':key));
      button.type='button';button.setAttribute('aria-pressed',String(activeMacroFilter===key));
      button.addEventListener('click',()=>{
        activeMacroFilter=key;render();
        document.querySelector('#macros .macro-filter[aria-pressed="true"]')?.focus();
      });
      filter.append(button);
    }
    section.append(filter);
    const store=versionData.macros||{};
    const selected=activeMacroFilter==='all'?categories:[activeMacroFilter];
    const list=el('div','macro-grid');
    for(const category of selected){
      const records=(Array.isArray(store[category])?store[category]:[])
        .filter(m=>m && typeof m.title==='string' && m.title.trim() && typeof m.code==='string' && m.code.trim())
        .map(m=>({...m,category}));
      if(!records.length){
        const card=el('article','macro-card macro-placeholder-card');
        const top=el('div','macro-card-top');
        const info=el('div','macro-card-title');
        const categoryLabel=tr(category==='qualityOfLife'?'qualityOfLife':category);
        info.append(el('span','macro-category',categoryLabel));
        info.append(el('h3','',tr('macroPlaceholderTitle',{category:categoryLabel})));
        top.append(info);card.append(top);
        card.append(paragraph('macro-placeholder',tr('macroComingSoon')));
        list.append(card);
        continue;
      }
      for(const macro of records){
        const card=el('article','macro-card');
        const top=el('div','macro-card-top');
        const info=el('div','macro-card-title');
        info.append(el('span','macro-category',tr(macro.category==='qualityOfLife'?'qualityOfLife':macro.category)));
        info.append(el('h3','',macro.title));
        top.append(info);
        const button=el('button','macro-copy-button',tr('copyMacro'));
        button.type='button';
        button.setAttribute('aria-label',tr('copyMacro')+': '+macro.title);
        button.append(icon('copy'));
        button.addEventListener('click',async()=>{
          const status=root.querySelector('.class-library-status');
          try{
            if(!navigator.clipboard) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(macro.code);
            status.textContent=tr('copied');button.textContent=tr('copied');button.append(icon('copy'));
          }catch{
            status.textContent=tr('copyFailed');
          }
          setTimeout(()=>{button.textContent=tr('copyMacro');button.append(icon('copy'));},1800);
        });
        top.append(button);card.append(top);
        const code=document.createElement('pre');code.className='macro-code';code.setAttribute('aria-label',tr('macroCode'));code.tabIndex=0;
        const codeNode=document.createElement('code');codeNode.textContent=macro.code;code.append(codeNode);card.append(code);
        if(macro.notes) card.append(paragraph('macro-note',macro.notes));
        list.append(card);
      }
    }
    section.append(list);return section;
  }

  function renderVersionContent(){
    const content=root.querySelector('#class-library-content');
    if(!content)return;
    content.replaceChildren();
    const versionData=library.classes[classKey].versions[activeVersion];
    if(!versionData){content.append(paragraph('library-empty',tr('loadError')));return;}
    const section=el('section','library-section');
    section.id='loadouts';section.setAttribute('aria-labelledby','loadouts-title');
    const heading=el('div','library-section-heading');
    addSectionLabel(heading,'01',tr('buildEyebrow').replace(/^01 \/ /,''));
    const title=el('h2','',tr('buildTitle'));title.id='loadouts-title';heading.append(title);
    heading.append(paragraph('',tr('buildIntro')));section.append(heading);
    const cards=el('div','plan-grid');
    cards.append(renderPlanCard('openWorld',versionData,activeVersion));
    cards.append(renderPlanCard('battleground',versionData,activeVersion));
    section.append(cards);
    content.append(section);
    content.append(renderSituational(versionData));
    content.append(renderConsumables(versionData));
    content.append(renderMacros(versionData));
  }

  function render(){
    if(!library || !library.classes[classKey]) return;
    document.documentElement.lang=window.siteI18n?.lang==='nb'?'nb':'en';
    const className=library.classes[classKey].name;
    document.title=window.siteI18n?.lang==='nb'?className+' PvP — WoW Classic og Forever — Thomalex / TRIEBSTARK':className+' PvP — WoW Classic & Forever — Thomalex / TRIEBSTARK';
    const description=document.querySelector('meta[name="description"]');
    if(description) description.content=window.siteI18n?.lang==='nb'?className+' PvP for Classic og Forever: gear-oppsett, situasjonsutstyr, forbruksvarer, macros og 3D-visninger.':className+' PvP for Classic and Forever: gear plans, situational items, consumables, macros, and 3D previews.';
    createRoot();
  }

  fetch('/data/wow-pvp-library.json',{cache:'no-cache'})
    .then(response=>{if(!response.ok) throw new Error('Library unavailable');return response.json();})
    .then(data=>{library=data;render();})
    .catch(()=>{root.setAttribute('aria-busy','false');root.replaceChildren(paragraph('library-error',tr('loadError')));});
  window.addEventListener('site:languagechange',()=>{if(library) render();});
})();
