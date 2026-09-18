(() => {
  const queens = [
    ['1968','Elizabeth Tavares','ET','République démocratique du Congo','Première reine de cette lignée.','assets/img/heritage/1968-elizabeth-tavares.png'],
    ['1969','Jeanne Mokomo','JM','République démocratique du Congo','Une page de l’histoire nationale.','assets/img/heritage/1969-jeanne-mokomo.png'],
    ['1970','Marie-Josée Basoko','MB','République démocratique du Congo','Une page de l’histoire nationale.','assets/img/heritage/1970-marie-josee-basoko.png'],
    ['1971','Martine Mualuke','MM','République démocratique du Congo','Une page de l’histoire nationale.','assets/img/heritage/1971-martine-mualuke.png'],
    ['1972','Ombayi Mukuta','OM','République démocratique du Congo','Miss Élégance au concours Miss Univers 1972.','assets/img/heritage/1972-ombayi-mukuta.jpeg'],
    ['1983','Bongo Lina','BL','République démocratique du Congo','Le retour de la couronne après onze années.'],
    ['1984','Chantal Lokange Lwali','CL','Kinshasa','Candidate à Miss Univers 1984 à Miami, aux États-Unis.','assets/img/heritage/1984-chantal-lokange-lwali.png'],
    ['1985','Kayonga (Benita) Mureka Tete','KM','Nord-Kivu','Demi-finaliste à Miss Monde 1985, Reine de beauté d’Afrique, Miss Photogénique et troisième à Miss Univers 1985.','assets/img/heritage/1985-kayonga-mureka-tete.jpeg'],
    ['1986','Likobe (Aimée) Dobala','LD','Équateur','Demi-finaliste au concours Miss Univers 1986 à Panama.','assets/img/heritage/1986-likobe-dobala.png'],
    ['1987','Mesatewa Tuzolana','MT','Kongo Central','Candidate au concours Miss International 1987 au Japon.','assets/img/heritage/1987-mesatewa-tuzolana.png'],
    ['1988','Sylvie Nia Bologna','SN','Kinshasa','Représentante de Kinshasa.'],
    ['1989','Alphonsine (Lumeka) Mulunge','AM','Kinshasa','Représentante de Kinshasa. Décédée à Paris en 2022.'],
    ['1990–1993','La couronne en silence','—','Trêve','Une pause dans l’histoire, avant le retour du concours.'],
    ['1994','Edith Ngalula-Baluisha','EN','République démocratique du Congo','La couronne retrouve la lumière.','assets/img/heritage/1994-edith-ngalula-baluisha.png'],
    ['2000','Florence Bandu','FB','République démocratique du Congo','Reine du passage au nouveau millénaire.','assets/img/heritage/2000-florence-bandu.png'],
    ['2004','Norah Mpela','NM','République démocratique du Congo','Première dauphine du concours Miss FESPAM 2005.','assets/img/heritage/2004-norah-mpela.png'],
    ['2005','Nelly Dembo Osongo','ND','République démocratique du Congo','Candidate au concours Miss Monde 2005.','assets/img/heritage/2005-nelly-dembo-osongo.png'],
    ['2006','Diane Mizumi Mwinga','DM','Katanga','Candidate au concours Miss Monde 2006.','assets/img/heritage/2006-diane-mizumi-mwinga.png'],
    ['2008','Christelle Mbila','CM','Kinshasa','Candidate au concours Miss Monde 2008.','assets/img/heritage/2008-christelle-mbila.png'],
    ['2012','Christelle Mbemi','CM','Kinshasa','Représentante de Kinshasa.','assets/img/heritage/2012-christelle-mbemi.png'],
    ['2016','Andrea Moloto','AM','Diaspora — Afrique du Sud','Représentante de la RDC à Miss Monde 2016.','assets/img/andrea-moloto-portrait.jpg']
  ];
  const track = document.querySelector('#legacy-track');
  track.innerHTML = queens.map((queen, index) => `<button class="legacy-card${index === 0 ? ' is-active' : ''}${queen[2] === '—' ? ' legacy-card--pause' : ''}" type="button" data-index="${index}" aria-pressed="${index === 0}"><span class="legacy-thumb">${queen[5] ? `<img src="${queen[5]}" alt="${queen[1]}" loading="lazy">` : `<b>${queen[2]}</b>`}</span><strong>${queen[0]}</strong><small>${queen[1]}</small></button>`).join('');
  const cards = [...track.querySelectorAll('.legacy-card')];
  const portrait = document.querySelector('#legacy-portrait');
  const year = document.querySelector('#legacy-year');
  const name = document.querySelector('#legacy-name');
  const region = document.querySelector('#legacy-region');
  const note = document.querySelector('#legacy-note');
  const current = document.querySelector('#legacy-current');
  let active = 0;
  function select(index, focus = false) {
    active = (index + queens.length) % queens.length;
    const queen = queens[active];
    cards.forEach((card, i) => { card.classList.toggle('is-active', i === active); card.setAttribute('aria-pressed', i === active); });
    year.textContent = queen[0]; name.textContent = queen[1]; region.textContent = queen[3]; note.textContent = queen[4]; current.textContent = String(active + 1).padStart(2, '0');
    portrait.classList.remove('is-changing'); void portrait.offsetWidth; portrait.classList.add('is-changing');
    portrait.innerHTML = queen[5] ? `<img src="${queen[5]}" alt="${queen[1]}">` : `<div class="legacy-placeholder" aria-label="Photo à venir"><span>${queen[2]}</span><small>Photo à venir</small></div>`;
    cards[active].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    if (focus) cards[active].focus({ preventScroll: true });
  }
  cards.forEach((card, index) => card.addEventListener('click', () => select(index)));
  document.querySelector('.legacy-prev').addEventListener('click', () => select(active - 1, true));
  document.querySelector('.legacy-next').addEventListener('click', () => select(active + 1, true));
  track.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') { event.preventDefault(); select(active - 1, true); } if (event.key === 'ArrowRight') { event.preventDefault(); select(active + 1, true); } });
  track.addEventListener('wheel', event => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); track.scrollLeft += event.deltaY; } }, { passive: false });
  select(0);
})();
