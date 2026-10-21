/*
 * BUCKET LIST
 *
 * This array mirrors the "CAPT Bucket List" Google Sheet, which is the source of truth.
 * Sheet columns: Item, Location, Category, Status, Date done, Notes.
 *
 * Do not fetch the sheet from the page. When the sheet changes, edit DESTINATIONS by hand.
 *
 * Sheet field -> property
 *   Item        -> name
 *   Location    -> city
 *   Category    -> category
 *   Status      -> status      ("Not yet", "Visited", or whatever the sheet says)
 *   Date done   -> dateDone    ("" until the sheet has a date; never invent one)
 *   Notes       -> notes       (kept so the row matches the sheet; never shown)
 *
 * Poster-only fields, not on the sheet:
 *   tagline    one line about the place (public copy, not a personal reason)
 *   facts      two or three short historical notes, checked against published history
 *   image      { webp, jpeg, alt, width, height, focus }
 *   credit     { author, authorUrl, license, licenseUrl, sourceUrl }
 *
 * Leave personal reasons, companions, and planned dates off entirely.
 * Empty fields are not rendered. The Notes field is never rendered, even when it has text.
 *
 * Adding a stop
 *   1. Add the row to the sheet.
 *   2. Append an object here, in the same order.
 *   3. Put a freely licensed photo in /images/bucket-list/ as WebP and JPEG.
 *      Use a new filename. That folder is cached for a year.
 *   4. Log the photo in IMAGE-LICENSES.md (source URL, author, license).
 *   5. New categories pick up a color on their own. Add a LIVERIES entry only
 *      when a category should keep a fixed color.
 */
(function () {
  var DESTINATIONS = [
    {
      name: "Cathedral Basilica of St. Louis",
      city: "St. Louis, MO",
      category: "Cathedral / basilica",
      status: "Not yet",
      dateDone: "",
      notes: "",
      tagline: "Romanesque granite outside. A Byzantine sky of glass inside.",
      facts: [
        "Barnett, Haynes & Barnett broke ground on 1 May 1907. The first Mass was 18 October 1914. Consecration waited until 29 June 1926.",
        "Romanesque Revival on the outside, Neo-Byzantine within. In 1997 Pope John Paul II named it a minor basilica. St. Louis still calls it the New Cathedral, to set it apart from the old one by the river.",
        "The mosaics, started in 1912 and finished in 1988, use 41.5 million glass tesserae in more than 7,000 colors across 83,000 square feet. One of the largest mosaic collections in the Western Hemisphere."
      ],
      image: {
        webp: "/images/bucket-list/cathedral-basilica-st-louis-mosaic.webp",
        jpeg: "/images/bucket-list/cathedral-basilica-st-louis-mosaic.jpg",
        alt: "Sanctuary and gilded mosaic arches inside the Cathedral Basilica of Saint Louis",
        width: 1600,
        height: 1200,
        focus: "center 42%"
      },
      credit: {
        author: "Farragutful",
        authorUrl: "https://commons.wikimedia.org/wiki/User:Farragutful",
        license: "CC BY-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Cathedral_Basilica_of_St._Louis_interior_04.jpg"
      }
    },
    {
      name: "Notre-Dame Basilica",
      city: "Montreal, QC, Canada",
      category: "Cathedral / basilica",
      status: "Not yet",
      dateDone: "",
      notes: "Passport needed",
      tagline: "Not the one in Paris. The night sky here is indoors.",
      facts: [
        "James O'Donnell, an Irish-American Anglican from New York, designed the Gothic Revival church. He converted to Catholicism on his deathbed and is the only person buried in the crypt.",
        "The cornerstone was laid on 1 September 1824 and the church was dedicated on 1 July 1829. For more than fifty years it was the largest church in North America.",
        "Victor Bourgeau painted the interior from 1872 to 1879: deep blue vaults, gold stars, a nod to the Sainte-Chapelle. The windows tell Montreal's religious history rather than scripture. The Casavant organ of 1891 has about 7,000 pipes."
      ],
      image: {
        webp: "/images/bucket-list/notre-dame-basilica-montreal-interior.webp",
        jpeg: "/images/bucket-list/notre-dame-basilica-montreal-interior.jpg",
        alt: "Interior of Notre-Dame Basilica in Montreal, a deep blue vault scattered with gold stars above the sanctuary",
        width: 1600,
        height: 1108,
        focus: "center"
      },
      credit: {
        author: "Diliff",
        authorUrl: "https://commons.wikimedia.org/wiki/User:Diliff",
        license: "CC BY-SA 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Notre-Dame_Basilica_Interior,_Montreal,_Canada_-_Diliff.jpg"
      }
    },
    {
      name: "St. Patrick's Cathedral",
      city: "New York, NY",
      category: "Cathedral / basilica",
      status: "Not yet",
      dateDone: "",
      notes: "",
      tagline: "White marble, raised while Fifth Avenue was still mostly rock.",
      facts: [
        "James Renwick Jr. designed it in Decorated neo-Gothic and clad it in Tuckahoe marble. It is the largest Gothic Revival Catholic cathedral in North America.",
        "The cornerstone was laid on 15 August 1858, before a crowd of about 100,000, on ground that was still mostly rock. The Civil War stopped the work. Dedication came on 25 May 1879. The spires, 329.5 feet, were added in 1888.",
        "It fills the block between Fifth and Madison, 50th and 51st, across from what is now Rockefeller Center. It replaced St. Patrick's Old Cathedral on Mulberry Street."
      ],
      image: {
        webp: "/images/bucket-list/st-patricks-cathedral-nyc-night.webp",
        jpeg: "/images/bucket-list/st-patricks-cathedral-nyc-night.jpg",
        alt: "St. Patrick's Cathedral at night, marble Gothic spires lit above a Fifth Avenue street",
        width: 1067,
        height: 1600,
        focus: "center 36%"
      },
      credit: {
        author: "Nan Palmero",
        authorUrl: "https://www.flickr.com/people/97402086@N00",
        license: "CC BY 2.0",
        licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Saint_Patrick%27s_Cathedral_(40611877404).jpg"
      }
    },
    {
      name: "Cathedral of Saint Paul",
      city: "St. Paul, MN",
      category: "Cathedral / basilica",
      status: "Not yet",
      dateDone: "",
      notes: "",
      tagline: "A copper dome on the hill, and the river town below it.",
      facts: [
        "Emmanuel Louis Masqueray, chief architect of the 1904 St. Louis World's Fair, designed this Beaux-Arts church. It was built from 1906 to 1915 on the brow of the hill, where Norman Kittson's mansion had stood.",
        "The copper-clad dome tops out at 306.5 feet. The church is the co-cathedral of the Archdiocese of Saint Paul and Minneapolis, paired with the Basilica of Saint Mary.",
        "It is the fourth building here to carry Paul's name. The first was a log chapel dedicated in 1841, when the settlement was still called Pig's Eye. In 2009 the U.S. bishops named this one the National Shrine of the Apostle Paul."
      ],
      image: {
        webp: "/images/bucket-list/cathedral-saint-paul-mn-selby.webp",
        jpeg: "/images/bucket-list/cathedral-saint-paul-mn-selby.jpg",
        alt: "Cathedral of Saint Paul on Cathedral Hill, copper dome and columned entrance seen from the street",
        width: 1600,
        height: 1200,
        focus: "center 38%"
      },
      credit: {
        author: "w_lemay",
        authorUrl: "https://www.flickr.com/photos/59081381@N03/51707923220/",
        license: "CC BY-SA 2.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Cathedral_of_Saint_Paul,_Selby_Avenue_and_Summit_Avenue,_Cathedral_Hill,_Saint_Paul,_MN_-_51707923220.jpg"
      }
    },
    {
      name: "Basilica of the National Shrine of the Immaculate Conception",
      city: "Washington, DC",
      category: "Cathedral / basilica",
      status: "Not yet",
      dateDone: "",
      notes: "",
      tagline: "The largest Catholic church on the continent. The cathedral is a different building.",
      facts: [
        "Byzantine Revival and Romanesque Revival, by Maginnis & Walsh of Boston, and the largest Catholic church in North America. Bishop Thomas Shahan took the idea to Pope Pius X in 1913. The pope sent his blessing, and $400.",
        "Ground was broken on 16 May 1920. The Depression and the war stopped the work above the crypt. The Great Upper Church was dedicated on 20 November 1959.",
        "Eighty-two chapels honor Mary. The Trinity Dome mosaic, twenty-four tons of Venetian glass, was dedicated on 8 December 2017. A minor basilica since 1990. The archdiocese's cathedral is St. Matthew the Apostle."
      ],
      image: {
        webp: "/images/bucket-list/national-shrine-immaculate-conception.webp",
        jpeg: "/images/bucket-list/national-shrine-immaculate-conception.jpg",
        alt: "Basilica of the National Shrine of the Immaculate Conception in Washington, dome and bell tower in daylight",
        width: 1600,
        height: 948,
        focus: "center"
      },
      credit: {
        author: "AgnosticPreachersKid",
        authorUrl: "https://commons.wikimedia.org/wiki/User:AgnosticPreachersKid",
        license: "CC BY-SA 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Basilica_of_the_National_Shrine_of_the_Immaculate_Conception.jpg"
      }
    },
    {
      name: "Washington National Cathedral",
      city: "Washington, DC",
      category: "Cathedral / basilica",
      status: "Not yet",
      dateDone: "",
      notes: "",
      tagline: "Eighty-three years of limestone, finished on the day it was begun.",
      facts: [
        "Its name is the Cathedral Church of Saint Peter and Saint Paul. It belongs to the Episcopal Church. Neo-Gothic, modeled on English work of the late fourteenth century, and the second-largest church building in the United States.",
        "The foundation stone, a piece from Bethlehem set into American granite, was laid on 29 September 1907 with Theodore Roosevelt there. The last finial, 1,008 pounds of Indiana limestone, was set on 29 September 1990 with George H. W. Bush there. Congress chartered the cathedral in 1893 and paid for none of the stone.",
        "The Space Window holds a fragment of lunar rock, dedicated on 21 July 1974. High on the northwest tower is a Darth Vader grotesque, from a public design contest, carved by Patrick J. Plunkett. Woodrow Wilson is the only American president buried in the District of Columbia."
      ],
      image: {
        webp: "/images/bucket-list/washington-national-cathedral-west.webp",
        jpeg: "/images/bucket-list/washington-national-cathedral-west.jpg",
        alt: "West front of Washington National Cathedral, a long Gothic limestone facade and central tower",
        width: 1200,
        height: 1600,
        focus: "center 40%"
      },
      credit: {
        author: "APK",
        authorUrl: "https://commons.wikimedia.org/wiki/User:APK",
        license: "CC BY 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Washington_National_Cathedral_-_9.jpg"
      }
    }
  ];

  /* Fixed colors for categories already on the sheet. Unknown categories
     rotate through FALLBACK_LIVERIES so a later stop still gets a color. */
  var LIVERIES = {
    "Cathedral / basilica": {
      ink: "#7c1c2b",
      deep: "#1a2744",
      gold: "#c6a15a",
      paper: "#f7f0df",
      stamp: "#9d2430"
    }
  };

  var FALLBACK_LIVERIES = [
    { ink: "#1e4d3a", deep: "#14261e", gold: "#d2b48c", paper: "#f3efe4", stamp: "#1e4d3a" },
    { ink: "#1a2744", deep: "#10182b", gold: "#d4a017", paper: "#f4efe2", stamp: "#1a2744" },
    { ink: "#8a4b08", deep: "#3d2a14", gold: "#e0c27a", paper: "#f8f1e2", stamp: "#8a4b08" },
    { ink: "#5c2d4a", deep: "#2c1624", gold: "#e4c9a0", paper: "#f7f0e8", stamp: "#5c2d4a" }
  ];

  function filled(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function safeUrl(url) {
    if (!filled(url)) return "";
    var trimmed = url.trim();
    if (/^https:\/\//i.test(trimmed)) return trimmed;
    return "";
  }

  function slug(name, index) {
    var base = String(name || "stop").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return base || "stop-" + (index + 1);
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function liveryFor(category, seen) {
    var key = filled(category) ? category.trim() : "";
    if (key && LIVERIES[key]) return LIVERIES[key];
    if (!key) key = "Uncategorized";
    if (!seen[key]) {
      var count = Object.keys(seen).length;
      seen[key] = FALLBACK_LIVERIES[count % FALLBACK_LIVERIES.length];
    }
    return seen[key];
  }

  function stampClass(status) {
    var s = status.trim();
    if (/^visited$/i.test(s)) return "stamp is-visited";
    if (/^not yet$/i.test(s)) return "stamp is-open";
    return "stamp is-other";
  }

  function styleAttr(livery) {
    return "--ink:" + livery.ink + ";--deep:" + livery.deep + ";--gold:" + livery.gold + ";--paper:" + livery.paper + ";--stamp:" + livery.stamp;
  }

  function uniqueCategories(items) {
    var cats = [];
    items.forEach(function (item) {
      var c = filled(item.category) ? item.category.trim() : "";
      if (c && cats.indexOf(c) === -1) cats.push(c);
    });
    return cats;
  }

  function deck(items) {
    var n = items.length;
    var notYet = 0;
    var visited = 0;
    items.forEach(function (item) {
      var s = filled(item.status) ? item.status.trim() : "";
      if (/^not yet$/i.test(s)) notYet += 1;
      else if (/^visited$/i.test(s)) visited += 1;
    });
    var count = n + (n === 1 ? " stop on the line." : " stops on the line.");
    if (n && notYet === n) return count + " The posters are printed. The dates are not.";
    if (n && visited === n) return count + " Every stamp has a date.";
    if (visited) return count + " " + visited + " stamped. The rest of the line is still open.";
    return count;
  }

  function kicker(items) {
    var cats = uniqueCategories(items);
    if (cats.length === 1) return cats[0];
    if (!cats.length) return "Open departures";
    return "Mixed timetable";
  }

  function photoHtml(item, eager) {
    var image = item.image || {};
    var webp = safeUrl(image.webp) || (typeof image.webp === "string" && image.webp.charAt(0) === "/" ? image.webp : "");
    var jpeg = safeUrl(image.jpeg) || (typeof image.jpeg === "string" && image.jpeg.charAt(0) === "/" ? image.jpeg : "");
    if (!webp && !jpeg) return "";
    var alt = esc(image.alt || item.name || "");
    var width = Number(image.width) || 1600;
    var height = Number(image.height) || 1000;
    var focus = filled(image.focus) ? image.focus.trim() : "center";
    var orient = width >= height ? "landscape" : "portrait";
    var loading = eager ? "eager" : "lazy";
    var priority = eager ? ' fetchpriority="high"' : "";
    var sources = "";
    if (webp) sources += '<source type="image/webp" srcset="' + esc(webp) + '">';
    var imgSrc = jpeg || webp;
    var credit = creditHtml(item.credit);
    return (
      '<figure class="poster-photo is-' + orient + '">' +
        "<picture>" + sources +
          '<img src="' + esc(imgSrc) + '" alt="' + alt + '" width="' + width + '" height="' + height + '" style="object-position:' + esc(focus) + '" loading="' + loading + '" decoding="async"' + priority + ">" +
        "</picture>" +
        credit +
      "</figure>"
    );
  }

  function creditHtml(credit) {
    if (!credit || !filled(credit.author)) return "";
    var authorUrl = safeUrl(credit.authorUrl);
    var licenseUrl = safeUrl(credit.licenseUrl);
    var sourceUrl = safeUrl(credit.sourceUrl);
    var author = authorUrl
      ? '<a href="' + esc(authorUrl) + '">' + esc(credit.author.trim()) + "</a>"
      : esc(credit.author.trim());
    var license = filled(credit.license)
      ? (licenseUrl
        ? '<a href="' + esc(licenseUrl) + '">' + esc(credit.license.trim()) + "</a>"
        : esc(credit.license.trim()))
      : "";
    var source = sourceUrl ? '<a href="' + esc(sourceUrl) + '">Wikimedia Commons</a>' : "";
    var bits = ["Photo: " + author];
    if (license) bits.push(license);
    if (source) bits.push(source);
    return '<figcaption class="credit">' + bits.join(", ") + ".</figcaption>";
  }

  function passHtml(item) {
    var rows = "";
    if (filled(item.city)) {
      rows += '<p class="pass-row"><span>To</span><strong>' + esc(item.city.trim()) + "</strong></p>";
    }
    if (filled(item.category)) {
      rows += '<p class="pass-row"><span>Class</span><strong>' + esc(item.category.trim()) + "</strong></p>";
    }
    if (filled(item.dateDone)) {
      rows += '<p class="pass-row"><span>Date</span><strong>' + esc(item.dateDone.trim()) + "</strong></p>";
    }
    var stamp = "";
    if (filled(item.status)) {
      stamp = '<p class="' + stampClass(item.status) + '" aria-label="Status: ' + esc(item.status.trim()) + '"><span>' + esc(item.status.trim()) + "</span></p>";
    }
    if (!rows && !stamp) return "";
    return (
      '<div class="pass">' +
        '<div class="pass-body">' +
          '<p class="pass-carrier">NavarreVal Lines</p>' +
          rows +
        "</div>" +
        stamp +
      "</div>"
    );
  }

  function hooksHtml(facts) {
    if (!facts || !facts.length) return "";
    var html = "";
    facts.forEach(function (fact) {
      if (filled(fact)) html += "<p>" + esc(fact.trim()) + "</p>";
    });
    if (!html) return "";
    return '<div class="hooks">' + html + "</div>";
  }

  function posterHtml(item, index, livery) {
    var id = slug(item.name, index);
    var eager = index === 0;
    var photo = photoHtml(item, eager);
    var tagline = filled(item.tagline) ? '<p class="tagline">' + esc(item.tagline.trim()) + "</p>" : "";
    var klass = filled(item.category) ? '<p class="poster-class">' + esc(item.category.trim()) + "</p>" : "";
    var city = filled(item.city) ? '<p class="poster-city">' + esc(item.city.trim()) + "</p>" : "";
    return (
      '<article class="poster reveal" id="' + esc(id) + '" style="' + styleAttr(livery) + '">' +
        '<div class="poster-sheet' + (photo ? "" : " no-photo") + '">' +
          photo +
          '<div class="poster-copy">' +
            '<p class="poster-index">Stop ' + pad(index + 1) + "</p>" +
            klass +
            "<h3>" + esc(filled(item.name) ? item.name.trim() : "Untitled stop") + "</h3>" +
            city +
            tagline +
            hooksHtml(item.facts) +
            passHtml(item) +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var kickerEl = document.getElementById("hero-kicker");
    var deckEl = document.getElementById("hero-deck");
    var routeEl = document.getElementById("route");
    var stopsEl = document.getElementById("stops");
    if (!stopsEl) return;

    if (kickerEl) kickerEl.textContent = kicker(DESTINATIONS);
    if (deckEl) deckEl.textContent = deck(DESTINATIONS);

    var seen = {};
    var groups = [];
    DESTINATIONS.forEach(function (item, index) {
      var category = filled(item.category) ? item.category.trim() : "Uncategorized";
      var last = groups[groups.length - 1];
      if (!last || last.category !== category) {
        groups.push({ category: category, livery: liveryFor(category, seen), items: [] });
        last = groups[groups.length - 1];
      }
      last.items.push({ item: item, index: index });
    });

    var route = '<div class="route-head"><p class="route-kicker">Schematic</p><h2 id="route-title">The line</h2><p class="route-note">In the order written down. Not to scale.</p></div>';
    if (groups.length) {
      route += '<ul class="legend">';
      var legendSeen = {};
      groups.forEach(function (group) {
        if (legendSeen[group.category]) return;
        legendSeen[group.category] = true;
        route += '<li style="' + styleAttr(group.livery) + '"><span class="swatch"></span>' + esc(group.category) + "</li>";
      });
      route += "</ul>";
    }
    route += '<ol class="rail">';
    DESTINATIONS.forEach(function (item, index) {
      var category = filled(item.category) ? item.category.trim() : "Uncategorized";
      var livery = liveryFor(category, seen);
      var id = slug(item.name, index);
      var place = filled(item.name) ? item.name.trim() : "Stop";
      var city = filled(item.city) ? item.city.trim() : "";
      route +=
        '<li style="' + styleAttr(livery) + '">' +
          '<a href="#' + esc(id) + '">' +
            '<span class="rail-dot" aria-hidden="true"></span>' +
            '<span class="rail-num">' + pad(index + 1) + "</span>" +
            '<span class="rail-place">' + esc(place) + "</span>" +
            (city ? '<span class="rail-city">' + esc(city) + "</span>" : "") +
          "</a>" +
        "</li>";
    });
    route += "</ol>";
    if (routeEl) routeEl.innerHTML = route;

    var html = "";
    groups.forEach(function (group) {
      html +=
        '<section class="class-block" style="' + styleAttr(group.livery) + '">' +
          '<header class="class-banner">' +
            "<p>Class of travel</p>" +
            "<h2>" + esc(group.category) + "</h2>" +
          "</header>";
      group.items.forEach(function (entry) {
        html += posterHtml(entry.item, entry.index, group.livery);
      });
      html += "</section>";
    });
    stopsEl.innerHTML = html;

    var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    function markInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight || 800;
      reveals.forEach(function (node) {
        var rect = node.getBoundingClientRect();
        if (rect.top < vh * 0.94 && rect.bottom > 0) node.classList.add("is-in");
      });
    }
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach(function (node) { observer.observe(node); });
    } else {
      reveals.forEach(function (node) { node.classList.add("is-in"); });
    }
    markInView();

    if (location.hash) {
      var target = document.querySelector(location.hash);
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ block: "start", behavior: "instant" });
        target.classList.add("is-in");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
