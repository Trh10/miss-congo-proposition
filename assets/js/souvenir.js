(() => {
  const photos = [
    ['assets/img/souvenir/couronnement.webp','Couronnement','L’instant où une nouvelle histoire commence.'],
    ['assets/img/souvenir/gala-defile.webp','Le défilé','Les candidates sur le podium de la grande finale.'],
    ['assets/img/souvenir/prestance-scene.webp','Prestance sur scène','La grâce, la voix et la fierté de représenter sa province.'],
    ['assets/img/souvenir/robes-or.webp','Robes d’or','Le passage en tenue de soirée.'],
    ['assets/img/souvenir/creation-pagne.webp','Création congolaise','Le pagne réinventé sur scène.'],
    ['assets/img/souvenir/gala-elegance.webp','Élégance du gala','Une soirée de beauté, de culture et de transmission.'],
    ['assets/img/souvenir/robe-noire.webp','En noir et blanc','Un dernier passage avant le verdict du jury.'],
    ['assets/img/souvenir/public-gala.webp','Le public','La salle se lève pour ses favorites.'],
    ['assets/img/souvenir/sacre.webp','Le sacre','Une nouvelle reine est couronnée.']
  ];
  const track = document.querySelector('#memory-track');
  const repeated = [...photos,...photos];
  track.innerHTML = repeated.map((photo,index) => `<button class="memory-card" type="button" data-index="${index % photos.length}" aria-label="Agrandir : ${photo[1]}"${index >= photos.length ? ' tabindex="-1" aria-hidden="true"' : ''} data-cursor="Agrandir"><img src="${photo[0]}" alt="${photo[1]}" loading="lazy"><span><b>${photo[1]}</b><small>${photo[2]}</small></span></button>`).join('');
  const box = document.querySelector('#memory-lightbox'); const image = box.querySelector('img'); const caption = box.querySelector('figcaption'); let active = 0;
  function show(index){ active=(index+photos.length)%photos.length; image.src=photos[active][0]; image.alt=photos[active][1]; caption.textContent=photos[active][1]; box.hidden=false; document.body.style.overflow='hidden'; }
  function close(){ box.hidden=true; document.body.style.overflow=''; }
  track.addEventListener('click',e=>{const card=e.target.closest('.memory-card');if(card)show(Number(card.dataset.index));});
  box.querySelector('.memory-close').addEventListener('click',close); box.querySelector('.memory-lightbox-prev').addEventListener('click',()=>show(active-1)); box.querySelector('.memory-lightbox-next').addEventListener('click',()=>show(active+1));
  box.addEventListener('click',e=>{if(e.target===box)close();}); document.addEventListener('keydown',e=>{if(box.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(active-1);if(e.key==='ArrowRight')show(active+1);});
})();
