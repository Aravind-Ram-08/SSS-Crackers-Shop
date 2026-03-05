// ═══════════════════════════════════════════════════════════════════════════════
// SSS Crackers — Complete Product Catalogue
// All products organized by category with prices from the official price list
// ═══════════════════════════════════════════════════════════════════════════════

let _id = 0;
const p = (name, category, categorySlug, price, boxContent, description = "") => ({
    id: ++_id,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    category,
    categorySlug,
    price,
    boxContent,
    description: description || `Premium quality ${name} from SSS Crackers. Sivakasi-made, safe and tested for a spectacular celebration.`,
    images: [],
    stock: 100,
    rating: (3.5 + Math.random() * 1.5).toFixed(1) * 1,
    numReviews: Math.floor(20 + Math.random() * 200),
    isFeatured: false,
    isBestseller: false,
    tags: [],
});

const products = [

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 1: ONE SOUND CRACKERS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p('5" Jallikattu', "One Sound Crackers", "one-sound-crackers", 160, "1 PKT", "The mighty Jallikattu — 5 inches of raw power. A single thunderous blast that commands attention. Made from the finest Sivakasi materials for a deep, resonant boom."), isFeatured: true, isBestseller: true, originalPrice: 200 },
    { ...p('4½" Bahubali', "One Sound Crackers", "one-sound-crackers", 150, "1 PKT", "Named after the legendary warrior, Bahubali crackers deliver a powerful 4.5-inch explosion that echoes through the neighbourhood. A true crowd favourite.") },
    { ...p('4" Kuruvi', "One Sound Crackers", "one-sound-crackers", 120, "1 PKT", "The Kuruvi packs a surprising punch for its size. A crisp, clean burst perfect for those who love classic single-sound crackers. Great for all celebrations.") },
    { ...p('4" Gold Lakshmi', "One Sound Crackers", "one-sound-crackers", 90, "1 PKT", "A premium 4-inch cracker adorned with the auspicious Lakshmi motif. Rich golden packaging and a satisfying, deep boom. Perfect for Diwali pujas and celebrations.") },
    { ...p('4" Dix Lakshmi', "One Sound Crackers", "one-sound-crackers", 90, "1 PKT", "The Dix Lakshmi 4-inch cracker offers excellent value with a strong, reliable detonation. Beautifully designed packaging makes it a festival essential.") },
    { ...p("Lakshmi & Parrot", "One Sound Crackers", "one-sound-crackers", 65, "1 PKT", "A classic duo-themed cracker featuring Lakshmi and Parrot artwork. Compact yet powerful, these are perfect for traditional celebrations and pujas.") },
    { ...p("Lakshmi", "One Sound Crackers", "one-sound-crackers", 65, "1 PKT", "The iconic Lakshmi cracker — a staple in every Indian household during Diwali. Reliable, affordable, and always satisfying. A timeless classic.") },
    { ...p("3½ Lakshmi & Parrot", "One Sound Crackers", "one-sound-crackers", 55, "1 PKT", "A slightly smaller version of the beloved Lakshmi & Parrot. Perfect for children's celebrations with a moderate sound level. Safe and fun.") },
    { ...p("2¾ Bird", "One Sound Crackers", "one-sound-crackers", 30, "1 PKT", "Compact and cheerful, the Bird cracker is ideal for younger enthusiasts. A light pop that brings smiles without overwhelming — perfect for family celebrations.") },
    { ...p("2 Sound Crackers", "One Sound Crackers", "one-sound-crackers", 100, "1 PKT", "A double-burst cracker that fires twice in quick succession. Two bangs for the price of one — adding extra excitement to your Diwali celebrations.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 2: DELUXE CRACKERS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("24 Deluxe", "Deluxe Crackers", "deluxe-crackers", 170, "1 BOX", "A box of 24 deluxe crackers that deliver premium sound and quality. Each cracker is individually wrapped for freshness and maximum performance.") },
    { ...p("28 Deluxe", "Deluxe Crackers", "deluxe-crackers", 180, "1 BOX", "28 premium crackers packed in an elegant box. Each one fires with a crisp, satisfying pop. Great value for festive gatherings and celebrations.") },
    { ...p("50 Deluxe", "Deluxe Crackers", "deluxe-crackers", 390, "1 BOX", "The party-size pack — 50 deluxe crackers for extended celebrations. Keep the festivities going with these reliable, high-quality crackers."), isBestseller: true, originalPrice: 490 },
    { ...p("100 Deluxe", "Deluxe Crackers", "deluxe-crackers", 750, "1 BOX", "The ultimate deluxe collection — 100 crackers in one box. Perfect for large gatherings, weddings, and community celebrations. Unbeatable value."), isFeatured: true, originalPrice: 950 },
    { ...p("50 Deluxe Special", "Deluxe Crackers", "deluxe-crackers", 750, "1 BOX", "Premium version of the 50-pack with enhanced formulation for louder, crisper pops. The gold standard of deluxe crackers. A true special edition.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 3: GIANT CHORSA
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("28 Chorsa", "Giant Chorsa", "giant-chorsa", 55, "1 BOX", "28 chorsa crackers that pop with a snappy, rapid-fire rhythm. Light them up and enjoy the staccato bursts that fill the air with festive energy.") },
    { ...p("56 Chorsa", "Giant Chorsa", "giant-chorsa", 85, "1 BOX", "Double the fun with 56 chorsa crackers! Rapid pops that create an exciting atmosphere. A crowd-pleaser for extended festivities.") },
    { ...p("28 Giant", "Giant Chorsa", "giant-chorsa", 90, "1 BOX", "The Giant format delivers bigger bangs with 28 oversized crackers. Each one packs a thunderous punch — feel the ground shake beneath you."), isBestseller: true, originalPrice: 120 },
    { ...p("56 Giant", "Giant Chorsa", "giant-chorsa", 165, "1 BOX", "56 giant crackers for maximum impact. The ultimate box for those who want non-stop, powerful explosions throughout their celebration.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 4: BIJILI CRACKERS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Red Bijili", "Bijili Crackers", "bijili-crackers", 68, "1 BOX", "Classic red bijili crackers — small but mighty. These iconic mini-crackers deliver rapid pops that kids and adults both love. A Diwali essential.") },
    { ...p("Stripped Bijili", "Bijili Crackers", "bijili-crackers", 80, "1 BOX", "Distinctive striped bijili crackers with a slightly louder pop than the classic variety. The eye-catching design adds extra flair to your celebrations."), isBestseller: true },
    { ...p("Gold Bijili", "Bijili Crackers", "bijili-crackers", 88, "1 BOX", "The premium gold bijili — our finest mini-cracker with enhanced formulation. Louder pops and golden packaging make this the king of bijili crackers.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 5: GROUND CHAKKAR
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Chakkar Big (10 Pcs)", "Ground Chakkar", "ground-chakkar", 85, "1 BOX", "10 big ground chakkars that spin with mesmerizing patterns of red, green, and golden sparks. Watch them whirl and dance on the ground — pure magic.") },
    { ...p("Chakkar Big (25 Pcs)", "Ground Chakkar", "ground-chakkar", 240, "1 BOX", "The value pack — 25 big chakkars for extended spinning fun. Enough to keep the celebrations going all night with dazzling ground displays.") },
    { ...p("Chakkar Ashoka", "Ground Chakkar", "ground-chakkar", 190, "1 BOX", "Premium Ashoka-branded chakkars with wider spin radius and longer burn time. Multi-colour sparks create a mesmerizing circular display on the ground.") },
    { ...p("Chakkar Special", "Ground Chakkar", "ground-chakkar", 350, "1 BOX", "Special edition chakkars with enhanced colour-changing formulation. From green to red to gold — each spin tells a different colour story."), isFeatured: true },
    { ...p("Chakkar Deluxe", "Ground Chakkar", "ground-chakkar", 420, "1 BOX", "Our finest ground chakkar with the longest burn time and most vibrant colours. A deluxe spinning experience that illuminates any celebration.") },
    { ...p("Butterfly", "Ground Chakkar", "ground-chakkar", 360, "1 BOX", "Unique butterfly-shaped spinners that flutter and dance on the ground with colourful sparks. A whimsical addition that children absolutely adore.") },
    { ...p("Bambaram Spinner", "Ground Chakkar", "ground-chakkar", 500, "1 BOX", "Traditional bambaram-style spinners that rotate at high speed, releasing cascading sparks in all directions. A stunning visual spectacle."), isBestseller: true },
    { ...p("4 x 4 Wheel", "Ground Chakkar", "ground-chakkar", 570, "1 BOX", "Four wheels connected in one spectacular unit. All four spin simultaneously, creating a mesmerizing cross-shaped spark pattern. Truly spectacular.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 6: FLOWER POTS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Flower Pots Small", "Flower Pots", "flower-pots", 390, "1 BOX", "Compact flower pot fountains that shoot beautiful showers of golden and coloured sparks upward. Perfect for smaller spaces and intimate gatherings.") },
    { ...p("Flower Pots Big", "Flower Pots", "flower-pots", 140, "1 BOX", "Larger flower pots with higher spark fountains and longer burn time. Creates a spectacular garden-like ambiance with showering golden sparks.") },
    { ...p("Flower Pots Special", "Flower Pots", "flower-pots", 224, "1 BOX", "Special edition flower pots with multi-stage colour changes. From silver to gold to crackling stars — each pot is a mini firework show."), isFeatured: true },
    { ...p("Flower Pots Ashoka", "Flower Pots", "flower-pots", 450, "1 BOX", "Premium Ashoka-grade flower pots with the tallest fountain height and richest colours. The flagship of our flower pot collection.") },
    { ...p("Colour Koti", "Flower Pots", "flower-pots", 660, "1 BOX", "A kaleidoscope of colour — these special pots erupt with vibrant multi-coloured sparks that paint the night in rainbow hues. Truly spectacular."), isBestseller: true },
    { ...p("Multi Pops", "Flower Pots", "flower-pots", 700, "1 BOX", "Flower pots that combine fountain effects with popping sounds. A delightful multi-sensory experience with sparks and crackles. A unique hybrid.") },
    { ...p("Peacock Colour", "Flower Pots", "flower-pots", 600, "1 BOX", "Inspired by the peacock's magnificent plumage, these pots display stunning blue, green, and gold spark patterns. Truly majestic.") },
    { ...p("Lucky Red & Green", "Flower Pots", "flower-pots", 650, "1 BOX", "Auspicious red and green dual-colour flower pots. The contrasting colours create a visually striking display. Perfect for festive celebrations.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 7: GARLAND BANG CRACKERS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("100 Wala Garland", "Garland Bang Crackers", "garland-bang-crackers", 50, "1 PKT", "100 crackers strung together in a festive garland. Hang it up, light one end, and enjoy a rapid-fire spectacle of pops and flashes.") },
    { ...p("200 Wala Garland", "Garland Bang Crackers", "garland-bang-crackers", 95, "1 PKT", "Double the length, double the excitement! 200 rapid-fire pops that create a wall of sound. Perfect for grand entrances and celebrations.") },
    { ...p("500 Wala Garland", "Garland Bang Crackers", "garland-bang-crackers", 220, "1 PKT", "The heavy-hitter — 500 crackers in one continuous garland. Minutes of non-stop popping that transforms any celebration into a grand event.") },
    { ...p("1000 Wala Garland", "Garland Bang Crackers", "garland-bang-crackers", 425, "1 PKT", "The legendary 1000 wala! An epic garland that fires for several minutes straight. The undisputed king of garland crackers. A Diwali must-have."), isFeatured: true, isBestseller: true },
    { ...p("2000 Wala Garland", "Garland Bang Crackers", "garland-bang-crackers", 850, "1 PKT", "Push the limits with 2000 continuous pops! An absolute spectacle that commands attention from the entire neighbourhood. The ultimate garland.") },
    { ...p("5000 Wala Garland", "Garland Bang Crackers", "garland-bang-crackers", 2050, "1 PKT", "The grandest of them all — 5000 crackers in one massive garland. A jaw-dropping display reserved for the most epic celebrations.") },
    { ...p("10000 Wala Garland", "Garland Bang Crackers", "garland-bang-crackers", 4100, "1 PKT", "The undisputed champion — 10,000 crackers! An incredible 10+ minute barrage of non-stop explosions. For events that demand the extraordinary.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 8: PENCIL
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Pencil Small (5 Pcs)", "Pencil", "pencil", 50, "1 PKT", "Slim, elegant pencil fireworks that shoot coloured sparks upward. Safe and easy to hold — perfect for children's celebrations with adult supervision.") },
    { ...p("Pencil Big (5 Pcs)", "Pencil", "pencil", 100, "1 PKT", "Larger pencil fireworks with higher spark fountains and longer burn time. Vibrant red, green, blue, and golden sparks illuminate the night."), isBestseller: true },
    { ...p("Colour Pencil (5 Pcs)", "Pencil", "pencil", 150, "1 PKT", "Multi-colour pencil fireworks that cycle through stunning colour stages. Each pencil is a mini firework show in your hand. Kids love these!") },
    { ...p("Electric Pencil (5 Pcs)", "Pencil", "pencil", 180, "1 PKT", "Electrifying pencil sparklers with crackling, electric-style sparks. Brighter and more intense than regular pencils. A premium experience.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 9: BOMBS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Atom Bomb Small", "Bombs", "bombs", 200, "1 BOX", "Compact atom bombs that deliver a devastating boom. Small in size but big on impact. These mini powerhouses shake the ground with every detonation.") },
    { ...p("Atom Bomb Big", "Bombs", "bombs", 400, "1 BOX", "The full-size atom bomb — a seismic blast that resonates for seconds. Feel the shockwave! Reserved for those who love maximum power."), isFeatured: true, isBestseller: true },
    { ...p("Hydrogen Bomb", "Bombs", "bombs", 600, "1 BOX", "The Hydrogen Bomb cracker — our most powerful single-blast cracker. A ground-shaking, ear-splitting explosion that dominates any celebration.") },
    { ...p("Nero King", "Bombs", "bombs", 500, "1 BOX", "Named after the emperor, Nero King bombs deliver a regal, commanding blast with a deep bass resonance. Premium-grade explosive content for maximum impact.") },
    { ...p("Classic Bomb", "Bombs", "bombs", 150, "1 BOX", "The trusty classic bomb — reliable, powerful, and always satisfying. A staple in every celebration toolkit. No frills, just pure explosive power.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 10: TWINKLING STAR
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Twinkling Star Small (10 Pcs)", "Twinkling Star", "twinkling-star", 70, "1 BOX", "Charming small twinkling stars that emit gentle, flickering sparks like real stars. Creates a magical, starry atmosphere. Perfect for children.") },
    { ...p("Twinkling Star Big (10 Pcs)", "Twinkling Star", "twinkling-star", 120, "1 BOX", "Larger twinkling stars with brighter, longer-lasting sparkle effects. Each star twinkles for up to 30 seconds with dazzling multi-colour sparks."), isBestseller: true },
    { ...p("Twinkling Star Special (10 Pcs)", "Twinkling Star", "twinkling-star", 200, "1 BOX", "Premium twinkling stars with colour-changing effect. Watch them shift from silver to gold to blue — a mesmerizing light show in your hands.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 11: STONE & CARTOON
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Snake Tablet (10 Pcs)", "Stone & Cartoon", "stone-cartoon", 30, "1 BOX", "The classic snake tablet — light it and watch a magical black snake emerge and grow from the tablet. A fascinating, safe item for all ages.") },
    { ...p("Whistling Cartoon", "Stone & Cartoon", "stone-cartoon", 50, "1 BOX", "Fun cartoon-themed whistling crackers that produce amusing sound effects. Shaped like popular characters, these are a hit with kids at every celebration.") },
    { ...p("Magic Stone", "Stone & Cartoon", "stone-cartoon", 40, "1 BOX", "Place the magic stone on the ground and light it — watch as it transforms and expands into surprising shapes. A crowd-pleasing novelty item.") },
    { ...p("Jumping Cartoon", "Stone & Cartoon", "stone-cartoon", 60, "1 BOX", "Hilarious jumping crackers in cartoon shapes that hop and bounce unpredictably. Sparks fly as they jump around — pure entertainment for all ages."), isBestseller: true },
    { ...p("Pop Pop Snappers", "Stone & Cartoon", "stone-cartoon", 35, "1 BOX", "Throw them on the ground and they pop! No fire needed — just toss and enjoy the snap. Safe, fun, and excitement for everyone.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 12: ROCKETS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Baby Rocket (5 Pcs)", "Rockets", "rockets", 80, "1 PKT", "Small rockets that zip into the sky with a whistling trail and burst into a shower of sparks. Compact but impressive — great for starters.") },
    { ...p("Rocket Big (5 Pcs)", "Rockets", "rockets", 200, "1 PKT", "Full-size rockets that soar high into the night sky and explode into dazzling star patterns. A spectacular aerial display for any celebration."), isFeatured: true, isBestseller: true },
    { ...p("Colour Rocket (5 Pcs)", "Rockets", "rockets", 300, "1 PKT", "Premium colour rockets that leave vibrant coloured trails and burst into multi-colour star formations high in the sky. A breathtaking sight.") },
    { ...p("Whistle Rocket (5 Pcs)", "Rockets", "rockets", 250, "1 PKT", "Rockets that scream upward with a distinctive whistle before detonating in a shower of sparks. The whistling ascent builds incredible anticipation.") },
    { ...p("Two Stage Rocket (5 Pcs)", "Rockets", "rockets", 350, "1 PKT", "Advanced two-stage rockets — first stage launches the rocket, second stage explodes into a magnificent aerial display. Double the excitement in one rocket.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 13: AERIAL FANCY
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Sky Shot 3 Shots", "Aerial Fancy", "aerial-fancy", 150, "1 BOX", "A trio of spectacular sky shots that fire into the heavens and burst into vivid colour patterns. Compact but impressive aerial display.") },
    { ...p("Sky Shot 5 Shots", "Aerial Fancy", "aerial-fancy", 250, "1 BOX", "Five back-to-back sky shots creating a stunning sequential aerial show. Each shot bursts into different colour combinations.") },
    { ...p("Sky Shot 10 Shots", "Aerial Fancy", "aerial-fancy", 450, "1 BOX", "Ten magnificent sky shots that paint the night sky in vivid colours. A mini firework display that rivals professional shows."), isFeatured: true, isBestseller: true },
    { ...p("Sky Shot 15 Shots", "Aerial Fancy", "aerial-fancy", 650, "1 BOX", "Fifteen rapid-fire sky shots — over a minute of continuous aerial spectacle. Multiple colours and patterns create a mesmerizing sky canvas.") },
    { ...p("Sky Shot 30 Shots", "Aerial Fancy", "aerial-fancy", 1200, "1 BOX", "The grand aerial display — 30 sequential shots that light up the entire sky. A professional-grade experience for the ultimate celebration.") },
    { ...p("Fancy Aerial (3 Pcs)", "Aerial Fancy", "aerial-fancy", 350, "1 BOX", "Specialty aerial shells that burst into unique fancy patterns — hearts, stars, and spirals. Premium effects that wow every spectator.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 14: SPECIAL FOUNTAIN
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Silver Fountain", "Special Fountain", "special-fountain", 180, "1 PKT", "A brilliant silver fountain that shoots a majestic plume of silvery sparks up to 8 feet. Creates a dazzling, shimmering display that captivates all.") },
    { ...p("Gold Fountain", "Special Fountain", "special-fountain", 200, "1 PKT", "Rich golden sparks cascade upward in a stunning fountain display. The warm golden glow creates an enchanting, festive atmosphere."), isBestseller: true },
    { ...p("Multi Colour Fountain", "Special Fountain", "special-fountain", 350, "1 PKT", "A rainbow fountain that cycles through seven vibrant colour stages. From red to blue to green to gold — each stage is more beautiful than the last."), isFeatured: true },
    { ...p("Crackling Fountain", "Special Fountain", "special-fountain", 300, "1 PKT", "A unique fountain that combines sparks with crackling sound effects. Visual beauty meets auditory excitement for a multi-sensory experience.") },
    { ...p("Mega Fountain", "Special Fountain", "special-fountain", 550, "1 PKT", "Our tallest and longest-burning fountain — reaching up to 15 feet with a 90-second display of cascading coloured sparks. Simply magnificent.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 15: REPEATING CAKE
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("25 Shots Cake", "Repeating Cake", "repeating-cake", 500, "1 BOX", "A 25-shot repeating cake that fires rapid-fire aerial bursts. Each shot explodes into shimmering stars — a non-stop barrage of colour.") },
    { ...p("50 Shots Cake", "Repeating Cake", "repeating-cake", 900, "1 BOX", "50 rapid-fire shots in one powerful cake. Nearly two minutes of continuous aerial spectacle. A crowd-favourite for large celebrations."), isFeatured: true, isBestseller: true },
    { ...p("100 Shots Cake", "Repeating Cake", "repeating-cake", 1800, "1 BOX", "The king of cakes — 100 consecutive aerial shots that create an unbroken wall of colour in the sky. Professional-grade for spectacular events.") },
    { ...p("200 Shots Cake", "Repeating Cake", "repeating-cake", 3500, "1 BOX", "The ultimate cake — 200 thunderous shots that rival a commercial firework display. A jaw-dropping 5+ minute aerial show. Pure spectacle.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 16: FANCY ITEMS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Champagne Bottle", "Fancy Items", "fancy-items", 250, "1 PKT", "A novelty firework shaped like a champagne bottle. Pop the cork and watch coloured sparks erupt — perfect for celebrations and parties."), isBestseller: true },
    { ...p("Flower Garland", "Fancy Items", "fancy-items", 200, "1 PKT", "A garland-shaped firework that blooms with colourful sparks along its length. Creates a beautiful floral effect on the ground.") },
    { ...p("Magic Wand (3 Pcs)", "Fancy Items", "fancy-items", 180, "1 PKT", "Wave the magic wand and shower golden sparks everywhere! Kids love these portable fountain wands. Safe with adult supervision for ages 12+.") },
    { ...p("Colour Smoke (5 Pcs)", "Fancy Items", "fancy-items", 150, "1 PKT", "Vivid coloured smoke tubes in red, blue, green, yellow, and purple. Perfect for photography, celebrations, and creating dramatic visual effects.") },
    { ...p("Paper Caps Gun Roll", "Fancy Items", "fancy-items", 40, "1 PKT", "Fun paper cap rolls for toy guns. Each roll contains 100 caps for endless toy-gun action. Safe entertainment for children during festivals.") },
    { ...p("Magic Candle", "Fancy Items", "fancy-items", 100, "1 PKT", "Trick birthday candles that relight themselves after being blown out. Sparkling fountain effect plus the relighting trick — endless laughter.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 17: SPARKLERS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("7cm Sparklers (10 Pcs)", "Sparklers", "sparklers", 20, "1 BOX", "Tiny sparklers perfect for small hands. 7cm of golden sparkle — safe, short burn time, and ideal for introducing little ones to the joy of Diwali.") },
    { ...p("10cm Sparklers (10 Pcs)", "Sparklers", "sparklers", 25, "1 BOX", "Classic hand-held sparklers that produce golden sparks. A Diwali essential that brings joy to every member of the family.") },
    { ...p("12cm Sparklers (10 Pcs)", "Sparklers", "sparklers", 30, "1 BOX", "Medium-length sparklers with a satisfying burn time. Perfect for drawing shapes in the air and creating light trails in photographs."), isBestseller: true },
    { ...p("15cm Sparklers (10 Pcs)", "Sparklers", "sparklers", 40, "1 BOX", "Full-length sparklers with an extended burn time. Enough time to draw, dance, and play. Bright golden sparks illuminate the night.") },
    { ...p("30cm Sparklers (10 Pcs)", "Sparklers", "sparklers", 70, "1 BOX", "Extra-long sparklers for the ultimate sparkling experience. Over a minute of continuous golden sparkle. The flagship of our sparkler collection."), isFeatured: true },
    { ...p("Green Sparklers (10 Pcs)", "Sparklers", "sparklers", 50, "1 BOX", "Eco-friendly green sparklers that burn with a brilliant emerald hue. Low-smoke formula makes them perfect for indoor celebrations.") },
    { ...p("Red Sparklers (10 Pcs)", "Sparklers", "sparklers", 50, "1 BOX", "Vibrant red sparklers that produce striking crimson sparks. A colourful alternative to traditional golden sparklers for a unique celebration.") },
    { ...p("Multi Colour Sparklers (10 Pcs)", "Sparklers", "sparklers", 60, "1 BOX", "The best of all worlds — sparklers that cycle through multiple colours. Green, red, blue, gold, and silver in one magical sparkler.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 18: MUSICAL SHOT
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Musical Shot 3 Shots", "Musical Shot", "musical-shot", 200, "1 BOX", "Three musical shots that fire with a melodic whistling sound before bursting into colourful stars. Sound and light fused into a magical experience.") },
    { ...p("Musical Shot 5 Shots", "Musical Shot", "musical-shot", 350, "1 BOX", "Five harmonious musical shots that create a symphony in the sky. Each shot whistles a different note before exploding into vivid colours."), isBestseller: true },
    { ...p("Musical Shot 10 Shots", "Musical Shot", "musical-shot", 650, "1 BOX", "A ten-shot musical masterpiece that fills the sky with colour and the air with melody. Each shot is tuned for a unique whistling pitch."), isFeatured: true },
    { ...p("Musical Shot 15 Shots", "Musical Shot", "musical-shot", 950, "1 BOX", "Fifteen musical shots for an extended aerial concert. Multiple colours, multiple melodies — a premium musical firework experience for grand celebrations.") },

    // ═════════════════════════════════════════════════════════════════════════
    // CATEGORY 19: SPECIAL ITEMS
    // ═════════════════════════════════════════════════════════════════════════
    { ...p("Diwali Family Combo", "Special Items", "special-items", 1999, "1 BOX", "The complete family pack — includes sparklers, flower pots, chakkars, pencils, and snake tablets. Everything you need for a memorable Diwali celebration."), isFeatured: true, isBestseller: true, originalPrice: 2499 },
    { ...p("Grand Celebration Pack", "Special Items", "special-items", 4999, "1 BOX", "Our grandest combo — premium crackers, aerial shots, cakes, fountains, and more. 50+ items for a spectacular, all-night celebration."), originalPrice: 5999 },
    { ...p("Mega Value Pack", "Special Items", "special-items", 2999, "1 BOX", "Maximum variety at unbeatable value. 30+ different items spanning all categories — the smartest way to shop for your festival needs."), originalPrice: 3499 },
    { ...p("Kids Special Pack", "Special Items", "special-items", 999, "1 BOX", "Curated for young crackers enthusiasts — sparklers, snake tablets, flower pots, and colour smoke. All safe items perfect for children's celebrations."), originalPrice: 1299, stock: 0 },
    { ...p("Premium Gift Box", "Special Items", "special-items", 7999, "1 BOX", "The ultimate gifting solution — a luxurious box of our finest fireworks. Premium packaging makes this the perfect festival gift for loved ones."), originalPrice: 9999, stock: 3 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Categories Master List
// ═══════════════════════════════════════════════════════════════════════════════
export const categories = [
    { name: "One Sound Crackers", slug: "one-sound-crackers", icon: "💥", count: products.filter(p => p.categorySlug === "one-sound-crackers").length },
    { name: "Deluxe Crackers", slug: "deluxe-crackers", icon: "🎆", count: products.filter(p => p.categorySlug === "deluxe-crackers").length },
    { name: "Giant Chorsa", slug: "giant-chorsa", icon: "⚡", count: products.filter(p => p.categorySlug === "giant-chorsa").length },
    { name: "Bijili Crackers", slug: "bijili-crackers", icon: "🔥", count: products.filter(p => p.categorySlug === "bijili-crackers").length },
    { name: "Ground Chakkar", slug: "ground-chakkar", icon: "🌀", count: products.filter(p => p.categorySlug === "ground-chakkar").length },
    { name: "Flower Pots", slug: "flower-pots", icon: "🌸", count: products.filter(p => p.categorySlug === "flower-pots").length },
    { name: "Garland Bang Crackers", slug: "garland-bang-crackers", icon: "🧨", count: products.filter(p => p.categorySlug === "garland-bang-crackers").length },
    { name: "Pencil", slug: "pencil", icon: "✏️", count: products.filter(p => p.categorySlug === "pencil").length },
    { name: "Bombs", slug: "bombs", icon: "💣", count: products.filter(p => p.categorySlug === "bombs").length },
    { name: "Twinkling Star", slug: "twinkling-star", icon: "⭐", count: products.filter(p => p.categorySlug === "twinkling-star").length },
    { name: "Stone & Cartoon", slug: "stone-cartoon", icon: "🎭", count: products.filter(p => p.categorySlug === "stone-cartoon").length },
    { name: "Rockets", slug: "rockets", icon: "🚀", count: products.filter(p => p.categorySlug === "rockets").length },
    { name: "Aerial Fancy", slug: "aerial-fancy", icon: "🎇", count: products.filter(p => p.categorySlug === "aerial-fancy").length },
    { name: "Special Fountain", slug: "special-fountain", icon: "⛲", count: products.filter(p => p.categorySlug === "special-fountain").length },
    { name: "Repeating Cake", slug: "repeating-cake", icon: "🎂", count: products.filter(p => p.categorySlug === "repeating-cake").length },
    { name: "Fancy Items", slug: "fancy-items", icon: "🎁", count: products.filter(p => p.categorySlug === "fancy-items").length },
    { name: "Sparklers", slug: "sparklers", icon: "✨", count: products.filter(p => p.categorySlug === "sparklers").length },
    { name: "Musical Shot", slug: "musical-shot", icon: "🎵", count: products.filter(p => p.categorySlug === "musical-shot").length },
    { name: "Special Items", slug: "special-items", icon: "📦", count: products.filter(p => p.categorySlug === "special-items").length },
];

export default products;
