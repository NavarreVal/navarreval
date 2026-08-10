document.addEventListener('DOMContentLoaded', () => {

  // ========== Panel Navigation ==========
  const links = document.querySelectorAll('.nav-link');
  const backButtons = document.querySelectorAll('.back-btn');

  function showPanel(id, direction = null) {
    const current = document.querySelector('.panel.active');
    const next = document.getElementById(id);
    if (!next || current === next) return;

    next.classList.remove('from-left','from-right','from-bottom','from-top','to-left','to-right','to-bottom','to-top');
    current.classList.remove('from-left','from-right','from-bottom','from-top','to-left','to-right','to-bottom','to-top');

    if (direction === 'left') {
      next.classList.add('from-right');
      current.classList.add('to-left');
    } else if (direction === 'right') {
      next.classList.add('from-left');
      current.classList.add('to-right');
    } else if (direction === 'bottom') {
      next.classList.add('from-top');
      current.classList.add('to-bottom');
    } else if (direction === 'top') {
      next.classList.add('from-bottom');
      current.classList.add('to-top');
    }

    void next.offsetWidth;
    next.classList.add('active');
    current.classList.remove('active');
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showPanel(link.getAttribute('href').substring(1), link.dataset.direction);
    });
  });

  backButtons.forEach(btn => {
    btn.addEventListener('click', () => showPanel('landing', 'top'));
  });

  // ========== Profile photo cycling ==========
  const profilePhotos = [
    "images/profilePics/navarre.jpg",
    "images/profilePics/navarre01.jpg",
    "images/profilePics/navarre02.jpg",
    "images/profilePics/navarre03.jpg",
    "images/profilePics/navarre04.jpg",
    "images/profilePics/navarre05.jpg",
    "images/profilePics/navarre06.jpg",
    "images/profilePics/navarre07.jpg",
    "images/profilePics/navarre08.jpg",
    "images/profilePics/navarre09.jpg",
    "images/profilePics/navarre10.jpg",
    "images/profilePics/navarre11.png",
    "images/profilePics/navarre12.png"
  ];

  const recentPhotos = [];
  const BLOCK_COUNT = 6;
  const profilePhoto = document.querySelector('.profile-photo');

  if (profilePhoto) {
    profilePhoto.style.cursor = 'pointer';
    profilePhoto.addEventListener('click', () => {
      let newIndex, attempts = 0;
      do {
        newIndex = Math.floor(Math.random() * profilePhotos.length);
        attempts++;
      } while (recentPhotos.includes(newIndex) && attempts < 20 && profilePhotos.length > BLOCK_COUNT);

      recentPhotos.push(newIndex);
      if (recentPhotos.length > BLOCK_COUNT) recentPhotos.shift();
      profilePhoto.src = profilePhotos[newIndex];
    });
  }

  // ========== Timeline Data ==========
  const timelineEvents = [
    {
      year: 2003,
      yearThumb: "images/timeline/calwest.jpg",
      events: [{
        id: "2003-shell",
        label: "Shell Station",
        title: "Shell Station / Local Jobs",
        role: "Work",
        desc: "There was a Mean Gene's Burgers, a Subway, and the Convenience Store. I worked all three counters as needed.<br><br>I had a few other random jobs around town as well, including at Cal Western Converting Inc.",
        thumb: "images/timeline/calwest.jpg",
        images: ["images/timeline/shell.jpg"]
      }]
    },
    {
      year: 2004,
      yearThumb: "images/timeline/200400.jpg",
      events: [
        {
          id: "2004-graduation",
          label: "Graduation",
          title: "Graduated from Golden West High School",
          role: "Education",
          desc: "<strong>The year:</strong> 2004.<br><strong>My GPA:</strong> not great<br>(enough for football & college!)<br><strong>My life:</strong> a blur.",
          thumb: "images/timeline/GWHS-logo.jpg",
          images: ["images/timeline/highschool.jpg", "images/timeline/alyssa_and_navarre.jpg"]
        },
        {
          id: "2004-argus",
          label: "Tallship Argus",
          title: "Summer 2004: Tallship Argus",
          role: "Work",
          desc: "I lived and worked aboard the Tallship Argus for the Orange County Council of the Boy Scouts of America. I was a certified deckhand in charge of the foresails. I conducted training, instruction, and supervision over our visiting groups.",
          thumb: "images/timeline/argus.jpg",
          images: ["images/timeline/argus.jpg", "images/timeline/navarreargus.jpg"]
        },
        {
          id: "2004-nauvoo",
          label: "BYU Nauvoo",
          title: "Fall 2004: BYU – Nauvoo",
          role: "Education",
          desc: "I had the opportunity to experience BYU's \"Semester Abroad\" program at BYU Nauvoo.<br><br>I was also apparently incapable of taking a normal picture of myself.",
          thumb: "images/timeline/nauvoo.jpg",
          images: ["images/timeline/nauvoo.jpg", "images/timeline/nauvoo01.jpg", "images/timeline/nauvoo02.jpg"]
        }
      ]
    },
    {
      year: 2005,
      yearThumb: "images/timeline/mission02.jpg",
      events: [{
        id: "2005-mission",
        label: "Mission Merida Mexico",
        title: "LDS Missionary Service",
        role: "Volunteer Service",
        desc: "I was called to serve a mission in the Merida Mexico Mission. I served from 2005-2007. I learned Spanish & Mayan and gained a strong testimony of the gospel of Jesus Christ, and a deep and abiding love for the people of the Yucatan.",
        thumb: "images/timeline/mission02.jpg",
        images: ["images/timeline/mission01.jpg", "images/timeline/mission03.jpg", "images/timeline/mission04.jpg", "images/timeline/mission05.jpg"]
      }]
    },
    {
      year: 2008,
      yearThumb: "images/timeline/libertySquare.png",
      events: [{
        id: "2008-ls",
        label: "Liberty Square Apartments",
        title: "Leasing Assistant",
        role: "Work & Education",
        desc: "Worked at Liberty Square Student Housing in the leasing office and doing general maintenance while attending BYU.",
        thumb: "images/timeline/libertySquare.png",
        images: []
      }]
    },
    {
      year: 2009,
      yearThumb: "images/timeline/rain01.png",
      events: [{
        id: "2009-rain",
        label: "Rain Nutrition",
        title: "IT Specialist",
        role: "Work",
        desc: "This felt like my first \"real\" job. I wore a lot of hats, because this was a small company. I handled Customer Support, Website Testing, and Database Management.<br>If I ever get rich, I'm going to recreate their Blueberry Energy Drink because MAN was it good!",
        thumb: "images/timeline/rain01.png",
        images: []
      }]
    },
    {
      year: 2011,
      yearThumb: "images/timeline/impact00.jpg",
      events: [{
        id: "2011-impact",
        label: "Impact Pest Service",
        title: "HR/Office Manager",
        role: "HR/Office Manager",
        desc: "We lived in Texas for a bit, and I worked for a pest control company doing office administration, employee management, and service streamlining. Eventually, this small business was bought out, and we returned to Utah.<br>Sometimes, we got up to nonsense.",
        thumb: "images/timeline/impact00.jpg",
        images: ["images/timeline/impact01.jpg"]
      }]
    },
    {
      year: 2012,
      yearThumb: "images/timeline/usu00.jpg",
      events: [{
        id: "2012-usu",
        label: "USU Family Housing",
        title: "Assistant Leasing Manager",
        role: "Work & Education",
        desc: "I worked in Family Housing while I attended USU doing their Law & Constitutional Studies undergrad. I loved the coursework so much!<br><br>Unfortunately, life circumstances prevented me from finishing that degree, but it was fun to indulge my passion for Law while there!",
        thumb: "images/timeline/usu00.jpg",
        images: ["images/timeline/usu01.jpg"]
      }]
    },
    {
      year: 2013,
      yearThumb: "images/timeline/cpix00.jpg",
      events: [{
        id: "2013-cpix",
        label: "CirclePix",
        title: "QA Engineer",
        role: "Work",
        desc: "I wore a couple different hats at this job as well, but landed in QA Engineering, getting my first real taste of true Engineering work and I was hooked!<br><br>Shoutout to the people at CirclePix who took a chance on me and gave me a *real* career trajectory!",
        thumb: "images/timeline/cpix00.jpg",
        images: ["images/timeline/cpix01.jpg"]
      }]
    },
    {
      year: 2015,
      yearThumb: "images/timeline/sahd00.jpg",
      events: [{
        id: "2015-sahd",
        label: "Stay at home Parent",
        title: "Dad!",
        role: "Work?",
        desc: "This was probably my favorite job I ever had. After a bout of health issues and other circumstances, I got to be home with my 2 year old son for a time, helping him through these formative years; learning to read, talk, and potty training. I miss this!",
        thumb: "images/timeline/sahd00.jpg",
        images: ["images/timeline/sahd01.jpg", "images/timeline/sahd02.jpg", "images/timeline/sahd03.jpg"]
      }]
    },
    {
      year: 2016,
      yearThumb: "images/timeline/201600.jpg",
      events: [
        {
          id: "2016-boost",
          label: "Boostability",
          title: "QA Specialist",
          role: "Work",
          desc: "After working through my health complications, and feeling ready to send my son back into the daycare world, I returned to work at Boostability.<br>We built, tested, and maintained websites for small business owners. My team worked mainly with people in Australia, which was a lot of fun!<br><br>This allowed me to get my feet wet again in the Tech world with the occasional use of Adobe Photoshop, Illustrator, and various front end development languages including HTML, CSS, and Javascript.",
          thumb: "images/timeline/boost00.png",
          images: ["images/timeline/boost01.jpg", "images/timeline/boost02.jpg"]
        },
        {
          id: "2016-ipart",
          label: "iPartnr Technologies",
          title: "QA/Operations/UX",
          role: "Work",
          desc: "This role was a major step up for me, and another area where I wore many hats and was able to expand my understanding of the tech world.<br><br>I got to delve into automated testing, script coding, and User Experience Research and Design.<br><br>I even got to attend my first work-related conference!",
          thumb: "images/timeline/ipart00.jpg",
          images: ["images/timeline/ipart01.jpg", "images/timeline/ipart02.jpg", "images/timeline/ipart03.jpg"]
        }
      ]
    },
    {
      year: 2017,
      yearThumb: "images/timeline/medici00.jpg",
      events: [{
        id: "2017-medici",
        label: "Medici Ventures",
        title: "Associate Scrum Master",
        role: "Work",
        desc: "Medici Ventures was a wholly owned subsidiary of Overstock focused on newly emerging Blockchain Technologies. For me, this role represented a turning point in my life, and another place where others took a chance on me and changed my life forever.<br><br>I started here in Software Testing and was encouraged to explore a role in Scrum. I was mentored by some of the best servant leaders I've ever had the good fortune of working with, was blessed to meet amazing people, make lifelong friendships, and I finally felt like I'd found my place in the tech world.",
        thumb: "images/timeline/medici00.jpg",
        images: ["images/timeline/medici01.jpg", "images/timeline/medici02.jpg", "images/timeline/medici03.jpg", "images/timeline/medici04.jpg"]
      }]
    },
    {
      year: 2019,
      yearThumb: "images/timeline/ihc00.png",
      events: [{
        id: "2019-ihc",
        label: "Intermountain Healthcare",
        title: "Application Systems Technical Analyst/Scrum Master",
        role: "Work",
        desc: "At Intermountain Healthcare, I had the opportunity to expand my professional capabilities by working within a large and well established organization. My teams were tasked with taking the many disparate apps and tools used by Providers, Administrators, Patients, and Families, and begin the work of bringing them all together into one central application. This role really stretched my capabilities and allowed me to truly strengthen my understanding and approach in Scrum and Agile.<br><br>This job was also cool because our office was in the World Trade Center in Salt Lake City, with great views of the LDS Office grounds, and the State Capital. My teams also pioneered work from home initiatives before the Covid Pandemic, and we were well positioned to transition to fully remote when that became the norm.",
        thumb: "images/timeline/ihc00.png",
        images: ["images/timeline/ihc03.jpg", "images/timeline/ihc04.jpg"]
      }]
    },
    {
      year: 2022,
      yearThumb: "images/timeline/gravity00.png",
      events: [{
        id: "2022-gravity",
        label: "Gravity Payments",
        title: "Sr Scrum Master",
        role: "Work",
        desc: "This was a fully remote role. In my role at Gravity Payments, I led multiple teams and projects while implementing Agile methodologies to enhance efficiency. I participated in creating the Project Management Organization, which improved project delivery processes. My coaching efforts empowered Project Managers and Scrum Masters to adopt Agile practices effectively, contributing to a more collaborative work environment.",
        thumb: "images/timeline/gravity00.png",
        images: ["images/timeline/gravity01.jpg", "images/timeline/gravity02.jpg", "images/timeline/gravity03.jpg"]
      }]
    }
  ];

  function getEventsForYear(year) {
    const entry = timelineEvents.find(e => e.year === year);
    return entry ? entry.events : [];
  }

  // ========== Selection + Detail overlays ==========
  const selectionPanel = document.createElement('div');
  selectionPanel.id = 'year-selection';
  selectionPanel.className = 'year-selection';
  document.body.appendChild(selectionPanel);

  const detailTooltip = document.createElement('div');
  detailTooltip.id = 'detail-tooltip';
  detailTooltip.className = 'timeline-tooltip';
  document.body.appendChild(detailTooltip);

  let currentYear = null;
  let currentMode = null;

  function closeAll() {
    selectionPanel.classList.remove('visible');
    detailTooltip.classList.remove('visible', 'pinned');
    currentYear = null;
    currentMode = null;
  }

  function openSelection(year, markElement) {
    const events = getEventsForYear(year);
    if (!events.length) return;

    currentYear = year;
    currentMode = 'selection';

    selectionPanel.innerHTML = `
      <div class="selection-header">
        <span class="selection-year">${year}</span>
        <span class="selection-count">${events.length} events</span>
      </div>
      <div class="selection-grid">
        ${events.map(ev => `
          <button class="selection-card" data-id="${ev.id}">
            ${ev.thumb
              ? `<img src="${ev.thumb}" alt="${ev.label}">`
              : `<div class="selection-placeholder">${ev.label.charAt(0)}</div>`}
            <span>${ev.label}</span>
          </button>
        `).join('')}
      </div>
    `;

    if (window.innerWidth <= 900) {
      selectionPanel.style.left = '50%';
      selectionPanel.style.top = '50%';
      selectionPanel.style.transform = 'translate(-50%, -50%)';
    } else if (markElement) {
      const rect = markElement.getBoundingClientRect();
      const panelWidth = 360;
      let left = rect.left + rect.width / 2 - panelWidth / 2;
      let top = rect.top - 240;
      left = Math.max(16, Math.min(left, window.innerWidth - panelWidth - 16));
      if (top < 16) top = rect.bottom + 20;
      selectionPanel.style.left = left + 'px';
      selectionPanel.style.top = top + 'px';
      selectionPanel.style.transform = 'none';
    }

    selectionPanel.classList.add('visible');

    selectionPanel.querySelectorAll('.selection-card').forEach(card => {
      card.addEventListener('click', e => {
        e.stopPropagation();
        const event = events.find(ev => ev.id === card.dataset.id);
        if (event) openDetail(event, markElement, year);
      });
    });
  }

  function openDetail(event, markElement = null, year = null) {
    currentMode = 'detail';
    if (year) currentYear = year;

    detailTooltip.innerHTML = `
      <span class="tip-year">${event.label}</span>
      <h3>${event.title}</h3>
      <p class="role">${event.role}</p>
      <p class="desc">${event.desc}</p>
      ${event.images && event.images.length ? `
        <div class="tooltip-gallery">
          <img src="${event.images[0]}" alt="" class="gallery-image">
          ${event.images.length > 1 ? `
            <button class="gallery-prev">‹</button>
            <button class="gallery-next">›</button>
            <div class="gallery-dots"></div>
          ` : ''}
        </div>
      ` : ''}
    `;

    if (window.innerWidth <= 900) {
      detailTooltip.style.left = '50%';
      detailTooltip.style.top = '50%';
      detailTooltip.style.transform = 'translate(-50%, -50%)';
    } else if (markElement) {
      const rect = markElement.getBoundingClientRect();
      const tipWidth = 280;
      const tipHeight = detailTooltip.offsetHeight || 320;
      let left = rect.left + rect.width / 2 - tipWidth / 2;
      let top = rect.top - tipHeight - 18;
      left = Math.max(16, Math.min(left, window.innerWidth - tipWidth - 16));
      if (top < 16) top = rect.bottom + 18;
      if (top + tipHeight > window.innerHeight - 16) top = window.innerHeight - tipHeight - 16;
      detailTooltip.style.left = left + 'px';
      detailTooltip.style.top = top + 'px';
      detailTooltip.style.transform = 'none';
    }

    detailTooltip.classList.add('visible', 'pinned');

    // ========== Gallery + Swipe ==========
    const img = detailTooltip.querySelector('.gallery-image');
    const prevBtn = detailTooltip.querySelector('.gallery-prev');
    const nextBtn = detailTooltip.querySelector('.gallery-next');
    const dotsContainer = detailTooltip.querySelector('.gallery-dots');
    const gallery = detailTooltip.querySelector('.tooltip-gallery');
    let currentImage = 0;

    if (dotsContainer && event.images && event.images.length > 1) {
      event.images.forEach((_, i) => {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        dotsContainer.appendChild(dot);
      });
    }

    function showImage(index) {
      if (!img || !event.images) return;
      currentImage = index;
      img.src = event.images[currentImage];
      if (dotsContainer) {
        dotsContainer.querySelectorAll('span').forEach((dot, i) => {
          dot.classList.toggle('active', i === currentImage);
        });
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', e => {
        e.stopPropagation();
        showImage((currentImage - 1 + event.images.length) % event.images.length);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', e => {
        e.stopPropagation();
        showImage((currentImage + 1) % event.images.length);
      });
    }

    // Swipe support
    if (gallery && event.images && event.images.length > 1) {
      let startX = 0;

      gallery.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
      }, { passive: true });

      gallery.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].screenX;
        const diff = startX - endX;

        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            // swipe left → next
            showImage((currentImage + 1) % event.images.length);
          } else {
            // swipe right → previous
            showImage((currentImage - 1 + event.images.length) % event.images.length);
          }
        }
      }, { passive: true });
    }
  }

  // Click outside to close
  document.addEventListener('click', e => {
    if (currentMode === 'detail') {
      if (!detailTooltip.contains(e.target)) {
        const events = getEventsForYear(currentYear);
        if (events.length > 1) {
          detailTooltip.classList.remove('visible', 'pinned');
          openSelection(currentYear, null);
        } else {
          closeAll();
        }
      }
    } else if (currentMode === 'selection') {
      if (!selectionPanel.contains(e.target)) closeAll();
    }
  });

  // ========== DESKTOP Horizontal Timeline ==========
  const track = document.getElementById('timeline-track');
  if (track) {
    track.innerHTML = '';

    for (let year = 2000; year <= 2030; year++) {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.dataset.year = year;

      const entry = timelineEvents.find(e => e.year === year);
      const events = entry ? entry.events : [];
      const hasData = events.length > 0;

      if (hasData) {
        item.classList.add('has-data');
        const side = (year % 2 === 0) ? 'top' : 'bottom';
        const distance = 75 + ((year * 17) % 55);
        item.classList.add(side);
        item.style.setProperty('--connector-height', distance + 'px');

        const iconSrc = entry.yearThumb || events[0].thumb || null;

        item.innerHTML = `
          <div class="timeline-content">
            <div class="timeline-icon-wrapper">
              ${iconSrc
                ? `<img src="${iconSrc}" alt="${year}" class="timeline-icon">`
                : `<div class="timeline-icon-placeholder">${String(year).slice(-2)}</div>`}
              <span class="year-label">${year}</span>
            </div>
            <div class="timeline-connector"></div>
          </div>
          <div class="timeline-mark"><div class="hash"></div></div>
        `;
      } else {
        item.innerHTML = `<div class="timeline-mark"><div class="hash"></div></div>`;
      }
      track.appendChild(item);
    }

    // Desktop click handlers
    document.querySelectorAll('.timeline-item.has-data').forEach(item => {
      const year = parseInt(item.dataset.year, 10);
      const mark = item.querySelector('.timeline-mark');
      const iconWrapper = item.querySelector('.timeline-icon-wrapper');

      const handler = e => {
        e.preventDefault();
        e.stopPropagation();
        const events = getEventsForYear(year);
        if (events.length === 1) {
          closeAll();
          openDetail(events[0], mark, year);
        } else if (events.length > 1) {
          closeAll();
          openSelection(year, mark);
        }
      };

      if (mark) mark.addEventListener('click', handler);
      if (iconWrapper) iconWrapper.addEventListener('click', handler);
    });
  }

  // Desktop arrows + wheel + center
  const timelineContainer = document.querySelector('.timeline-container');
  const arrowLeft = document.querySelector('.timeline-arrow.left');
  const arrowRight = document.querySelector('.timeline-arrow.right');

  function updateArrowStates() {
    if (!timelineContainer || !arrowLeft || !arrowRight) return;
    const maxScroll = timelineContainer.scrollWidth - timelineContainer.clientWidth;
    arrowLeft.classList.toggle('disabled', timelineContainer.scrollLeft <= 2);
    arrowRight.classList.toggle('disabled', timelineContainer.scrollLeft >= maxScroll - 2);
  }

  if (timelineContainer) {
    timelineContainer.addEventListener('scroll', updateArrowStates);

    timelineContainer.addEventListener('wheel', e => {
      e.preventDefault();
      const scrollAmount = e.deltaY > 0 ? 140 : -140;
      timelineContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }, { passive: false });

    if (arrowLeft && arrowRight) {
      arrowLeft.addEventListener('click', () => timelineContainer.scrollBy({ left: -280, behavior: 'smooth' }));
      arrowRight.addEventListener('click', () => timelineContainer.scrollBy({ left: 280, behavior: 'smooth' }));
      window.addEventListener('resize', updateArrowStates);
      updateArrowStates();
    }

    // Center on load
    requestAnimationFrame(() => {
      const maxScroll = timelineContainer.scrollWidth - timelineContainer.clientWidth;
      timelineContainer.scrollLeft = maxScroll / 2;
      updateArrowStates();
    });
  }

  // ========== MOBILE Vertical Timeline ==========
  const mobileTimeline = document.getElementById('mobile-timeline');
  if (mobileTimeline) {
    mobileTimeline.innerHTML = '';

    const sorted = [...timelineEvents].sort((a, b) => b.year - a.year);

    sorted.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'mobile-card';
      card.dataset.year = entry.year;

      const iconSrc = entry.yearThumb || (entry.events[0] && entry.events[0].thumb) || null;
      const firstEvent = entry.events[0];

      card.innerHTML = `
        <div class="mobile-card-icon">
          ${iconSrc
            ? `<img src="${iconSrc}" alt="${entry.year}">`
            : `<div class="mobile-placeholder">${String(entry.year).slice(-2)}</div>`}
        </div>
        <div class="mobile-card-content">
          <div class="mobile-card-year">${entry.year}</div>
          <div class="mobile-card-title">${firstEvent ? firstEvent.title : ''}</div>
          <div class="mobile-card-role">${firstEvent ? firstEvent.role : ''}</div>
          ${entry.events.length > 1 ? `<div class="mobile-card-more">+${entry.events.length - 1} more</div>` : ''}
        </div>
      `;

      card.addEventListener('click', e => {
        e.stopPropagation();
        const events = entry.events;
        if (events.length === 1) {
          closeAll();
          openDetail(events[0], null, entry.year);
        } else {
          closeAll();
          openSelection(entry.year, null);
        }
      });

      mobileTimeline.appendChild(card);
    });
  }

  // ========== Lightbox ==========
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox?.querySelector('.lightbox-image');

  if (lightbox && lightboxImg) {
    document.addEventListener('click', e => {
      if (e.target.classList.contains('gallery-image')) {
        e.stopPropagation();
        lightboxImg.src = e.target.src;
        lightbox.classList.add('active');
      }
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        lightboxImg.src = '';
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        lightboxImg.src = '';
      }
    });
  }
});