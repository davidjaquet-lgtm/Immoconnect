// ── Autocomplétion d'adresse via la Base Adresse Nationale (gratuite, sans clé) ──
// Usage :
//   initAutocompleteAdresse({ input:'adresse', inputVille:'ville', inputCP:'cp',
//                             onSelect:function(r){ /* r.lat, r.lng, r.ville, r.cp, r.label */ } });
// Pour un champ ville/secteur simple : { input:'localisation', type:'municipality', fillLabel:true }
function initAutocompleteAdresse(opts){
  var input = document.getElementById(opts.input);
  if(!input) return;
  input.setAttribute('autocomplete','off');
  var wrap = input.parentNode; wrap.style.position = 'relative';
  var box = document.createElement('div');
  box.style.cssText = 'position:absolute;left:0;right:0;top:100%;z-index:9999;background:#fff;border:1px solid #E8E6E0;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.10);max-height:230px;overflow:auto;font-size:13px;display:none;margin-top:2px';
  wrap.appendChild(box);
  var timer = null;

  function reset(){ if(opts.onSelect) opts.onSelect({lat:null,lng:null}); }

  input.addEventListener('input', function(){
    var q = input.value.trim();
    reset();
    if(q.length < 3){ box.style.display='none'; return; }
    clearTimeout(timer);
    timer = setTimeout(function(){
      var url = 'https://api-adresse.data.gouv.fr/search/?q=' + encodeURIComponent(q) + '&limit=5' + (opts.type ? '&type=' + opts.type : '');
      fetch(url).then(function(r){ return r.json(); }).then(function(d){
        box.innerHTML = '';
        var feats = (d && d.features) || [];
        if(!feats.length){ box.style.display='none'; return; }
        feats.forEach(function(f){
          var p = f.properties, c = f.geometry.coordinates; // [lng, lat]
          var item = document.createElement('div');
          item.style.cssText = 'padding:9px 12px;cursor:pointer;border-bottom:1px solid #F1EFE8';
          item.textContent = p.label;
          item.onmouseover = function(){ item.style.background = '#F5F2EC'; };
          item.onmouseout  = function(){ item.style.background = '#fff'; };
          item.onclick = function(){
            input.value = opts.fillLabel ? (p.city || p.label) : (p.name || p.label);
            if(opts.inputVille){ var ev=document.getElementById(opts.inputVille); if(ev) ev.value = p.city || ''; }
            if(opts.inputCP){ var ec=document.getElementById(opts.inputCP); if(ec) ec.value = p.postcode || ''; }
            if(opts.onSelect) opts.onSelect({ lat:c[1], lng:c[0], ville:p.city, cp:p.postcode, label:p.label });
            box.style.display = 'none';
          };
          box.appendChild(item);
        });
        box.style.display = 'block';
      }).catch(function(){ box.style.display='none'; });
    }, 250);
  });

  document.addEventListener('click', function(e){
    if(e.target !== input && !box.contains(e.target)) box.style.display = 'none';
  });
}
