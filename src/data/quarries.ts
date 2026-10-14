import type { Conditions, Option, Quarry, ScoreMap } from "@/lib/game-types";
import { scored as S } from "@/lib/game-types";

const spot = (id: string, label: string, detail: string, tell: string): Option => ({
  id,
  label,
  detail,
  tell,
});

function channelSpots(c: Conditions): ScoreMap {
  if (c.water === "muddy" || c.stage === "rising") {
    return {
      slack: S(3, "Rising mud pushes cats out of the seam and into the slack below a feeder."),
      dike: S(2, "A dike eddy is the backup slack if the creek mouth is boiling."),
      sandbar: S(1, "They nose a bar on the rise, then leave."),
      hole: S(0, "The deep bend is a highway in rising mud. They won't sit there."),
      seam: S(0, "The main seam is too much current once the river comes up."),
    };
  }
  if (c.water === "clear" && c.tempF <= 58) {
    return {
      hole: S(3, "Clear and cool. Channel cats slide into the outside bend and wait."),
      seam: S(2, "The seam above the hole still feeds if the bait stays on the bottom."),
      dike: S(1, "Dike eddies are a maybe. Most of the fish are deeper."),
      slack: S(1, "The creek mouth is thin when the river is clear and cold."),
      sandbar: S(0, "A sandbar in clear cold water is a place to skip."),
    };
  }
  if (c.water === "clear") {
    return {
      hole: S(3, "Clear water belongs on the outside bend, off the bank and on the bottom."),
      seam: S(2, "The current seam is the lane into that hole."),
      dike: S(1, "You can catch one off a dike. It isn't the school."),
      slack: S(0, "Clear and stable, the slack creek mouth is empty."),
      sandbar: S(0, "Too shallow and too bright."),
    };
  }
  if (c.windMph >= 14 || c.pressure === "falling") {
    return {
      dike: S(3, "Stained water and a restless glass. Fish the soft eddy behind the dike."),
      slack: S(2, "The feeder mouth is the second stop on the same float."),
      hole: S(1, "Some fish hold deep, but the active ones are shallower."),
      seam: S(1, "Stay on the slow side of the seam or keep moving."),
      sandbar: S(0, "The bar is too exposed for this wind."),
    };
  }
  return {
    dike: S(3, "Stained and stable is wing-dike water. Sit the eddy."),
    slack: S(2, "A creek mouth is the second stop."),
    hole: S(1, "The bend holds fish that aren't ready to eat."),
    seam: S(1, "A quick drift, then move."),
    sandbar: S(0, "Skip the skinny bar."),
  };
}

function channelPlays(c: Conditions): ScoreMap {
  if (c.water === "muddy" || c.stage === "rising") {
    return {
      dip: S(3, "Mud and rising water. Dip bait or shad guts out-fish a clean offering."),
      cut: S(2, "Cut bait still works if it leaks scent and sits still."),
      crawler: S(1, "A nightcrawler gets bit, mostly by smaller fish."),
      live: S(0, "Live bait disappears in the mud. They can't find it."),
      plug: S(0, "A topwater plug is a lure for a different fish."),
    };
  }
  if (c.water === "clear") {
    return {
      live: S(3, "Clear water. A lively bluegill or shad on the bottom is the read."),
      cut: S(2, "Fresh cut bait is the honest second choice."),
      crawler: S(1, "Worms catch channel cats. Not the better fish today."),
      dip: S(0, "Prepared bait clouds a clear hole and they slide off."),
      plug: S(0, "They're not looking up."),
    };
  }
  if (c.pressure === "falling") {
    return {
      cut: S(3, "Stained water, falling glass. Fresh cut shad is the bite."),
      dip: S(2, "Dip bait is close behind it."),
      live: S(1, "Live bait works, slower than something that stinks."),
      crawler: S(1, "A worm will scratch one on the edge of the eddy."),
      plug: S(0, "Leave the plugs in the box."),
    };
  }
  return {
    cut: S(3, "Stained and steady. Cut bait on the bottom of the eddy."),
    dip: S(2, "Dip bait is a fine backup in stain."),
    live: S(1, "Live bait if the eddy is clearer than it looks."),
    crawler: S(1, "Worms will scratch a few."),
    plug: S(0, "Wrong tool."),
  };
}

function channelWindows(c: Conditions): ScoreMap {
  if (c.water === "clear" && (c.moon === "full" || c.moon === "new")) {
    return {
      night: S(3, "Clear water under a strong moon. The bite is after full dark."),
      dusk: S(2, "Dusk starts it. Stay past the handoff."),
      dawn: S(1, "Dawn is a short window, then they quit."),
      morning: S(0, "Mid-morning is dead in clear water."),
      midday: S(0, "Noon is for running the motor."),
    };
  }
  if (c.pressure === "falling" || c.sky === "storm" || c.sky === "overcast") {
    return {
      dusk: S(3, "Falling glass. Be set before dusk and fish into the dark."),
      dawn: S(2, "Dawn gets the tail of the same feed."),
      night: S(1, "Night still produces, after the main push."),
      morning: S(1, "A leftover bite if the front is still west of you."),
      midday: S(0, "By noon the window has closed."),
    };
  }
  if (c.tempF >= 78) {
    return {
      night: S(3, "Warm water. Channel cats eat after the bank goes dark."),
      dusk: S(2, "Be fishing when the sun leaves the water."),
      dawn: S(1, "A thin dawn bite, then nothing."),
      morning: S(0, "The bank is warm and empty."),
      midday: S(0, "Midday heat. They're buried."),
    };
  }
  return {
    dusk: S(3, "The ordinary good hour for channel cats is dusk."),
    dawn: S(2, "Dawn is the other half of the same idea."),
    night: S(1, "Stay a little past dark if you can."),
    morning: S(1, "Mid-morning only if you already missed dusk."),
    midday: S(0, "Midday is the wrong commit."),
  };
}

function smallmouthSpots(c: Conditions): ScoreMap {
  if (c.water === "muddy" || c.stage === "rising") {
    return {
      eddy: S(3, "Rising mud. Smallmouth tuck into the slack eddy and sulk within reach."),
      pool: S(2, "The tail of a deep pool is the second place they hide."),
      shoal: S(0, "A rocky shoal in the mud is a place to lose jigs."),
      riffle: S(0, "The fast riffle is chocolate milk. Nothing is hunting there."),
      grass: S(1, "A soft bank eddy with a little grass will hold one."),
    };
  }
  if (c.tempF <= 52 && c.water === "clear") {
    return {
      pool: S(3, "Cold and clear. Slow down on the tail of the deepest pool."),
      shoal: S(2, "The shoal wakes up only if the sun gets on it."),
      eddy: S(1, "An eddy is a resting spot, not the feed."),
      riffle: S(0, "Too cold for the riffle head."),
      grass: S(0, "There isn't a grass bite in this water."),
    };
  }
  if (c.sky === "clear" && c.windMph <= 8 && c.tempF >= 68) {
    return {
      riffle: S(3, "Warm, clear, light wind. They'll hunt the head of the riffle."),
      shoal: S(2, "The rocky shoal is the same fish, one cast off the current."),
      pool: S(1, "The pool is where they go when you spook the riffle."),
      eddy: S(1, "Use the eddy as a rest stop, not the whole float."),
      grass: S(0, "This is a rock river, not a grass lake."),
    };
  }
  if (c.water === "stained") {
    return {
      eddy: S(3, "Stain puts them tight to the bank eddy, out of the push."),
      shoal: S(2, "A shallow shoal on the slow side still eats."),
      pool: S(1, "Deeper fish are there. They're just not the biters."),
      riffle: S(0, "Too much current for stained-water smallmouth."),
      grass: S(1, "Any soft cover on the bank is worth three casts."),
    };
  }
  return {
    shoal: S(3, "Clear enough, stable enough. A crawfish jig on the rocky shoal."),
    riffle: S(2, "The riffle head is the aggressive fish."),
    pool: S(1, "Drop into the pool if the shoal is silent."),
    eddy: S(1, "The eddy is a maybe on the way downstream."),
    grass: S(0, "Wrong cover for this river."),
  };
}

function smallmouthPlays(c: Conditions): ScoreMap {
  if (c.water === "muddy" || c.stage === "rising") {
    return {
      grub: S(3, "Mud. A small dark grub they can find by feel."),
      jig: S(2, "A craw jig still works if you crawl it, not hop it."),
      minnow: S(1, "Live bait is a compromise in the stain."),
      top: S(0, "They can't see a topwater bait in this water."),
      spin: S(0, "A big spinnerbait is too much metal for a sulking fish."),
    };
  }
  if (c.tempF >= 68 && (c.peak === "dawn" || c.peak === "dusk" || c.sky !== "clear") && c.water === "clear") {
    return {
      top: S(3, "Warm, low light, clear water. Walk a topwater over the shoal."),
      jig: S(2, "The craw jig cleans up after the surface quits."),
      grub: S(1, "A grub is a follow-up, not the first cast."),
      minnow: S(1, "A minnow will catch a fish and spook the rest."),
      spin: S(0, "Too big and too loud for this clear shoal."),
    };
  }
  if (c.tempF <= 52) {
    return {
      jig: S(3, "Cold. Drag a craw jig and let it sit."),
      grub: S(2, "A small grub on a light head is the backup."),
      minnow: S(1, "Live bait if the regulations on that stretch allow it and the jig fails."),
      top: S(0, "Nothing is looking up."),
      spin: S(0, "You'll snag the pool and move one fish."),
    };
  }
  return {
    jig: S(3, "A craw-colored jig on the rocks is the default smallmouth read."),
    grub: S(2, "Downsize to a grub if they're following and not eating."),
    top: S(1, "One topwater pass at the low-light end, then put it away."),
    minnow: S(1, "A minnow is fine. It isn't the better idea."),
    spin: S(0, "Save the spinnerbait for dirtier water than this."),
  };
}

function smallmouthWindows(c: Conditions): ScoreMap {
  if (c.tempF <= 52) {
    return {
      midday: S(3, "Cold water. Wait until the sun has been on the pool."),
      morning: S(2, "Late morning is the start of that window."),
      dawn: S(1, "Dawn is pretty and slow."),
      dusk: S(1, "A short dusk bite once the day has warmed the river."),
      night: S(0, "Smallmouth are not a night fish here."),
    };
  }
  if (c.peak === "dusk" || c.sky === "overcast") {
    return {
      dusk: S(3, "The solunar peak and the low light land on dusk. Be there."),
      dawn: S(2, "Dawn is the other good hour."),
      morning: S(1, "Mid-morning still moves a few."),
      midday: S(0, "High sun, even under cloud, is the lull."),
      night: S(0, "After dark you're fishing for a different species."),
    };
  }
  return {
    dawn: S(3, "First light on the shoal, before the tubers and the sun."),
    morning: S(2, "Stay through mid-morning if dawn was quiet."),
    dusk: S(1, "Dusk is a second chance, shorter than dawn."),
    midday: S(0, "Noon belongs to the ramp."),
    night: S(0, "Not a night bite."),
  };
}

function crappieSpots(c: Conditions): ScoreMap {
  if (c.month >= 3 && c.month <= 5 && c.tempF >= 56 && c.tempF <= 68 && c.water !== "muddy") {
    return {
      flat: S(3, "Prespawn temperatures. The shallow flat with brush is the spot."),
      brush: S(2, "Deeper brush is where they stage before the flat."),
      ledge: S(1, "The channel ledge is the route in, not the bed."),
      windward: S(1, "Wind stacks bait, but the fish want the shallow wood."),
      open: S(0, "Open water is empty of spawners."),
    };
  }
  if (c.water === "muddy" || c.stage === "rising") {
    return {
      windward: S(3, "Mud and a rise. Shallow windward wood is the only place with enough light."),
      brush: S(2, "Brush in two to four feet, not the deep pile."),
      flat: S(1, "A flat only if it has cover sticking out of the stain."),
      ledge: S(0, "They leave the deep ledge when the water dirties up."),
      open: S(0, "Nothing to orient to, nothing to catch."),
    };
  }
  if (c.water === "clear" && c.pressure === "rising") {
    return {
      ledge: S(3, "Clear and a rising glass. They bury on the channel ledge."),
      brush: S(2, "The deepest brush pile you can find is the second stop."),
      windward: S(1, "Wind helps only if it's blowing onto that ledge."),
      flat: S(0, "The flat is a spooking ground in clear high pressure."),
      open: S(0, "They're not suspended where you can see bottom."),
    };
  }
  return {
    brush: S(3, "Stained and stable. A brush pile in 8 to 12 feet."),
    windward: S(2, "If the wind is pushing bait, fish the wood on that bank."),
    ledge: S(1, "The ledge is a fallback when the pile is silent."),
    flat: S(0, "Too shallow for this month unless they're spawning, and they aren't."),
    open: S(1, "A slow troll between piles will scratch one."),
  };
}

function crappiePlays(c: Conditions): ScoreMap {
  if (c.water === "clear" && (c.pressure === "rising" || c.sky === "clear")) {
    return {
      jig: S(3, "Clear and bright. A small jig, vertical, in the cover."),
      minnow: S(2, "A minnow under a slip float if they'll still come up two feet."),
      troll: S(1, "Trolling a jig finds the school. Then stop and hover."),
      bug: S(0, "A topwater bug is a bluegill mistake."),
      crank: S(0, "A crankbait is the wrong size and the wrong speed."),
    };
  }
  if (c.water === "muddy") {
    return {
      minnow: S(3, "Mud. A minnow under a float they can smell and see up close."),
      jig: S(2, "A jig tipped with something that smells, fished slow."),
      troll: S(1, "Cover water only until you get one bite."),
      bug: S(0, "They will not come to the surface in the mud."),
      crank: S(0, "Wrong bait."),
    };
  }
  return {
    minnow: S(3, "A minnow on a slip float over the brush is the crappie read."),
    jig: S(2, "A 1/16 ounce jig when the float won't get bit."),
    troll: S(1, "Spider-rigging finds fish. It isn't the fun part."),
    bug: S(0, "Leave the fly rod for bluegill."),
    crank: S(0, "Too big, too fast."),
  };
}

function crappieWindows(c: Conditions): ScoreMap {
  if (c.water === "clear" && c.sky === "clear") {
    return {
      midday: S(3, "Clear and bright. They bite once the sun puts them tight to the wood."),
      morning: S(2, "Late morning is the start of that."),
      dawn: S(1, "Dawn is a short, shallow look, then they drop."),
      dusk: S(1, "Dusk lifts a few back up."),
      night: S(0, "Without dock lights you're guessing."),
    };
  }
  if (c.peak === "dawn" || c.sky === "overcast") {
    return {
      dawn: S(3, "Low light and cloud. Be on the pile at dawn."),
      morning: S(2, "The bite often runs to mid-morning."),
      dusk: S(1, "A second, shorter window."),
      midday: S(0, "Midday they tuck so deep in the brush you won't feel them."),
      night: S(0, "Not tonight."),
    };
  }
  return {
    morning: S(3, "The reliable crappie hour is the first half of the morning."),
    dawn: S(2, "Start at dawn so you're settled when they turn on."),
    dusk: S(1, "Dusk is worth an hour, not a whole trip."),
    midday: S(1, "Midday only if you vertical-jig the deep pile."),
    night: S(0, "Go home."),
  };
}

function largemouthSpots(c: Conditions): ScoreMap {
  if (c.water === "muddy" || c.stage === "rising") {
    return {
      pocket: S(3, "Muddy rise. A shallow pocket out of the current, dark bottom."),
      timber: S(2, "Laydown timber on the soft bank is the second stop."),
      pads: S(1, "Pads only if they're in the mud line, not out in the chop."),
      flat: S(0, "The wind-blown flat is too open once the water dirties."),
      ledge: S(0, "They leave the river ledge and go shallow in a rise."),
    };
  }
  if (c.tempF <= 55) {
    return {
      ledge: S(3, "Cold. The deeper ledge or the channel swing, slow."),
      timber: S(2, "Vertical timber that reaches that depth."),
      pocket: S(1, "A pocket only on the warmest hour of the day."),
      flat: S(0, "The flat is vacant."),
      pads: S(0, "Pads in cold water are scenery."),
    };
  }
  if (c.windMph >= 8 && c.windMph <= 16 && c.sky !== "clear") {
    return {
      flat: S(3, "A walking wind onto a flat. Bait stacks, bass follow."),
      timber: S(2, "Timber on the same windward bank."),
      pads: S(1, "Pads if they're on the upwind side."),
      pocket: S(1, "The pocket is the lee. That's the wrong side today."),
      ledge: S(0, "They're not deep while the wind is feeding the flat."),
    };
  }
  if (c.tempF >= 78 && (c.peak === "dawn" || c.sky === "overcast")) {
    return {
      pads: S(3, "Warm and low light. The pad edge and the shade under it."),
      flat: S(2, "The flat outside the pads if you hear them blowing up."),
      timber: S(1, "Timber is the fallback when the sun gets up."),
      pocket: S(1, "A pocket if it has shade."),
      ledge: S(0, "Too early and too warm for the ledge."),
    };
  }
  return {
    timber: S(3, "A timber point is the all-purpose bass spot on a backwater."),
    flat: S(2, "The flat if there's any wind at all."),
    pocket: S(1, "Check the pocket on the way in."),
    pads: S(1, "A few casts on the pad edge, then move."),
    ledge: S(0, "Save the ledge for a cold front."),
  };
}

function largemouthPlays(c: Conditions): ScoreMap {
  if (c.water === "muddy") {
    return {
      spin: S(3, "Mud. A spinnerbait or a dark jig they can track."),
      jig: S(2, "A black and blue jig in the cover if they won't chase."),
      top: S(0, "They won't come up for a buzzbait in chocolate water."),
      drop: S(0, "A drop shot is a clear-water tool."),
      dough: S(0, "Dough bait is for carp. This is a bass read."),
    };
  }
  if (c.tempF <= 55) {
    return {
      jig: S(3, "Cold. A jig crawled on the ledge."),
      drop: S(2, "A drop shot if the water is clear enough to watch it."),
      spin: S(1, "A slow spinnerbait will move one fish."),
      top: S(0, "Nothing is on top."),
      dough: S(0, "Not a bait. Not a joke that scores."),
    };
  }
  if (c.tempF >= 70 && c.water === "clear" && (c.peak === "dawn" || c.peak === "dusk" || c.sky === "overcast")) {
    return {
      top: S(3, "Warm, clear, low light. A buzzbait or a walking bait."),
      spin: S(2, "A spinnerbait when they slash and miss the topwater."),
      jig: S(1, "The jig is for after the sun gets high."),
      drop: S(1, "Finesse if the flat gets pressured."),
      dough: S(0, "No."),
    };
  }
  return {
    jig: S(3, "A jig around the timber is the steady largemouth play."),
    spin: S(2, "Cover water with a spinnerbait until you find the timber that eats."),
    top: S(1, "One pass on top at the ends of the day."),
    drop: S(1, "Downsize only if follows don't commit."),
    dough: S(0, "That's not a bass bait."),
  };
}

function largemouthWindows(c: Conditions): ScoreMap {
  if (c.tempF <= 55) {
    return {
      midday: S(3, "Cold front or cold water. The warmest hour, midday, on the ledge."),
      morning: S(2, "Late morning as the bank starts to heat."),
      dawn: S(1, "Dawn looks right and fishes wrong when they're cold."),
      dusk: S(1, "A short dusk look after a warm afternoon."),
      night: S(0, "Not in this temperature."),
    };
  }
  if (c.pressure === "falling" || c.sky === "overcast" || c.sky === "storm") {
    return {
      dawn: S(3, "Falling glass. Be on the flat at dawn, before the front finishes them."),
      dusk: S(2, "Dusk is the second window if the front stalls."),
      morning: S(1, "Mid-morning only while the clouds hold."),
      midday: S(0, "If the sun comes out, the bite dies."),
      night: S(0, "You don't need the dark today."),
    };
  }
  return {
    dawn: S(3, "First light. That's the largemouth commit on an ordinary day."),
    dusk: S(2, "Last light is the makeup window."),
    morning: S(1, "Stay an hour past sunrise, then move or go to work."),
    midday: S(0, "High sun. They're in the shade and sulking."),
    night: S(1, "A night bite exists in summer. It isn't better than dawn today."),
  };
}

function flatheadSpots(c: Conditions): ScoreMap {
  if (c.stage === "rising" || c.water === "muddy") {
    return {
      jam: S(3, "Rising river. Flatheads pin up in the logjam out of the push."),
      mouth: S(2, "The creek mouth is the second piece of slack."),
      riprap: S(1, "Riprap holds one if the rock breaks the current."),
      bend: S(0, "The deep bend is too much water moving."),
      riffle: S(0, "A riffle in the mud is empty of flatheads."),
    };
  }
  if (c.water === "clear" && c.tempF >= 70) {
    return {
      jam: S(3, "Summer nights. The logjam, live bait, after dark."),
      riprap: S(2, "Riprap that dumps into a hole is the travel route."),
      bend: S(1, "The outside bend holds the ones that aren't feeding yet."),
      mouth: S(1, "A creek mouth if it has wood."),
      riffle: S(0, "Too shallow and too fast."),
    };
  }
  if (c.tempF <= 55) {
    return {
      bend: S(3, "Cold. Flatheads stack in the deep outside bend and barely move."),
      jam: S(2, "A jam that sits on the edge of that hole."),
      riprap: S(1, "Rock only where it meets deep water."),
      mouth: S(0, "The creek mouth is too shallow now."),
      riffle: S(0, "No."),
    };
  }
  return {
    jam: S(3, "Wood in the current seam. That's a flathead spot."),
    bend: S(2, "The deep bend just downstream of the wood."),
    mouth: S(1, "Creek mouth if the jam is occupied."),
    riprap: S(1, "Riprap is a maybe between jams."),
    riffle: S(0, "Wrong depth, wrong speed."),
  };
}

function flatheadPlays(c: Conditions): ScoreMap {
  if (c.tempF <= 55) {
    return {
      live: S(3, "Cold flatheads want a live bluegill set on the bottom and left alone."),
      swim: S(2, "A big swimbait dragged, not burned, is the artificial version."),
      cut: S(1, "Cut bait catches channel cats in the same hole. Flatheads prefer it alive."),
      frog: S(0, "Nothing is eating a frog in this water temperature."),
      worm: S(0, "A worm is an insult and a channel-cat bait."),
    };
  }
  if (c.water === "muddy") {
    return {
      live: S(3, "Even in the mud, a struggling live bait is what a flathead moves for."),
      cut: S(2, "Cut bait is the scent backup."),
      swim: S(1, "A dark swimbait if you can't get bait."),
      frog: S(0, "They won't track a frog in the stain."),
      worm: S(0, "Wrong species."),
    };
  }
  return {
    live: S(3, "Live bluegill or green sunfish, hooked through the back, on a slip sinker."),
    swim: S(2, "A heavy swimbait through the jam if live bait isn't an option."),
    cut: S(1, "Cut bait will be eaten by something. Often not the flathead."),
    frog: S(1, "A frog-colored jig at night, only in clear summer water, is a distant third."),
    worm: S(0, "You'll catch ten channel cats and zero flatheads."),
  };
}

function flatheadWindows(c: Conditions): ScoreMap {
  if (c.tempF <= 55) {
    return {
      midday: S(3, "Cold flatheads feed in the warmest part of the day, and not much."),
      morning: S(2, "Late morning into that window."),
      dawn: S(1, "Dawn is traditional and slow."),
      dusk: S(1, "Dusk only if the afternoon was warm."),
      night: S(0, "They're shut down after dark in the cold."),
    };
  }
  return {
    night: S(3, "Flatheads are a night fish once the water is warm enough."),
    dusk: S(2, "Set up before dusk so the bait is already in place."),
    dawn: S(1, "A leftover bite at first light, then it's over."),
    morning: S(0, "Morning is channel-cat time, not flathead time."),
    midday: S(0, "They're in the wood, not eating."),
  };
}

function deerSpots(c: Conditions): ScoreMap {
  if (c.windMph >= 16) {
    return {
      cedar: S(3, "This wind blows a ridge stand. Get in the cedar and sit still."),
      bench: S(2, "A sidehill bench breaks the wind if the cedar is dead."),
      bottom: S(1, "The creek bottom swirls. One deer, maybe."),
      ridge: S(0, "Your scent will paint the whole oak slope."),
      cut: S(0, "An open cut in a hard wind is a place they look at and leave."),
    };
  }
  if (c.pressure === "falling" && (c.sky === "overcast" || c.sky === "storm")) {
    return {
      bottom: S(3, "Falling glass and cloud. They'll be on their feet in the creek bottom."),
      bench: S(2, "The bench is the trail into that bottom."),
      ridge: S(1, "Acorns still matter. They won't be up on the open ridge in a front."),
      cedar: S(1, "Bedding cover is where they go after the move, not during it."),
      cut: S(0, "They will not cross the open cut with weather coming."),
    };
  }
  if (c.pressure === "rising" && c.sky === "clear" && c.tempF <= 55) {
    return {
      ridge: S(3, "Post-front, cool and clear. South-slope acorns at first light."),
      bench: S(2, "If the ridge is pressured, the bench just off it is the same idea."),
      bottom: S(1, "The bottom is a midday loaf, not the dawn feed."),
      cedar: S(0, "They're not bedded yet. Don't hunt the bedroom."),
      cut: S(0, "A noon cut is how you educate deer."),
    };
  }
  if (c.tempF >= 68) {
    return {
      bottom: S(3, "Warm for the coat they've grown. The cooler creek bottom, not the ridge."),
      cedar: S(2, "Shade if the bottom is noisy."),
      bench: S(1, "A shaded bench is the compromise."),
      ridge: S(0, "The oak ridge is too warm and too bright."),
      cut: S(0, "Open sun. They won't be there."),
    };
  }
  if (c.month === 11) {
    return {
      ridge: S(3, "November. Hunt the ridge where a buck checks the does and the scrapes."),
      bench: S(2, "A bench funnel still works if the ridge is crowded."),
      bottom: S(1, "Does are in the bottom. Don't ignore it, don't start there."),
      cedar: S(1, "You can cut a cruiser off the cedar. It isn't a pattern."),
      cut: S(0, "Sitting the open cut at the wrong hour burns the farm."),
    };
  }
  return {
    ridge: S(3, "Ordinary fall day, wind you can hunt. The south-slope oaks."),
    bench: S(2, "The bench if the ridge wind won't stay in your face."),
    bottom: S(1, "The bottom is the second sit, later."),
    cedar: S(0, "In a calm, the cedar is where you bump them."),
    cut: S(0, "The open cut educates every deer that uses it."),
  };
}

function deerPlays(c: Conditions): ScoreMap {
  if (c.windMph >= 16) {
    return {
      still: S(3, "Too much wind for a stand. Still-hunt the thick stuff, ten steps and look."),
      stand: S(1, "A stand only if it's buried in the cedar, not on the ridge."),
      stalk: S(2, "A short stalk on a bedded deer you actually see."),
      rattle: S(0, "Rattling in a gale is theater."),
      noon: S(0, "A noon field sit in this wind is a nap."),
    };
  }
  if (c.month === 11 && c.windMph <= 12) {
    return {
      rattle: S(3, "November, wind you can trust. Rattle and a grunt on the ridge, then shut up."),
      stand: S(2, "If you won't call, the stand with the wind in your face is still right."),
      still: S(1, "Still-hunting works between rattling setups."),
      stalk: S(1, "Stalk only a deer you've already seen."),
      noon: S(0, "Noon in the open is how bucks get a PhD."),
    };
  }
  if (c.pressure === "falling") {
    return {
      stand: S(3, "They're moving. Sit the trail with the wind in your face and don't wander."),
      still: S(2, "A slow still-hunt if you don't have a stand on the right trail."),
      stalk: S(1, "Stalking moving deer in the timber goes badly."),
      rattle: S(0, "Save the horns for November."),
      noon: S(0, "Don't sit a field and hope."),
    };
  }
  return {
    stand: S(3, "Wind in your face, stand on the edge, first light. The basic good hunt."),
    still: S(2, "Still-hunt only if you're late and the stand is blown."),
    stalk: S(1, "A stalk is a specific deer, not a plan."),
    rattle: S(0, "Outside the rut, rattling educates more bucks than it brings."),
    noon: S(0, "The noon field sit is the trap."),
  };
}

function deerWindows(c: Conditions): ScoreMap {
  if (c.tempF >= 68) {
    return {
      last: S(3, "Warm. They wait until last light to stand up and feed."),
      dawn: S(2, "Dawn is a short look, then they bed."),
      midmorning: S(1, "A cruiser between beds. Don't count on it."),
      midday: S(0, "Midday in the heat is an empty woods."),
      midnight: S(0, "You are not hunting after legal light."),
    };
  }
  if (c.pressure === "falling" || c.peak === "dusk") {
    return {
      last: S(3, "The move lines up with last light. Be in the tree before it."),
      dawn: S(2, "Dawn still matters. Last light matters more today."),
      midmorning: S(1, "They may stay up an hour later ahead of the front."),
      midday: S(0, "Not midday."),
      midnight: S(0, "After legal hours is not a strategy this game will score."),
    };
  }
  if (c.moon === "full" && c.sky === "clear") {
    return {
      dawn: S(3, "Bright moon. They fed some at night. Dawn is still the hunt, and it's shorter."),
      midday: S(1, "A midday look in the cover, not the field."),
      last: S(2, "Last light is thinner than usual. Hunt it anyway if dawn was quiet."),
      midmorning: S(1, "The hour after sunrise is the real dawn today."),
      midnight: S(0, "Night hunting deer is not the play, and it isn't legal light."),
    };
  }
  return {
    dawn: S(3, "First light. That's the whitetail commit."),
    last: S(2, "Last light is the second sit."),
    midmorning: S(1, "Mid-morning only on a cold front's tail."),
    midday: S(0, "Midday is how you bump a bed."),
    midnight: S(0, "Be out of the woods at the end of legal light."),
  };
}

function doveSpots(c: Conditions): ScoreMap {
  if (c.windMph >= 12) {
    return {
      water: S(3, "A wind drops the flight line onto the waterhole. Pass-shoot the approach."),
      sun: S(2, "The sunflower edge still works, lower than yesterday."),
      bar: S(1, "A bare bar with decoys if you can hide."),
      creek: S(1, "A creek crossing is a narrow version of the waterhole."),
      roost: S(0, "Leave the roost alone. Shoot them on the flight, not where they sleep."),
    };
  }
  if (c.sky === "clear" && c.tempF >= 75) {
    return {
      water: S(3, "Hot and clear. They have to water. Sit the flight line in the afternoon."),
      sun: S(2, "Feed first, water second, if you can only hunt one."),
      bar: S(1, "Decoys on a bare spot between the two."),
      creek: S(1, "A shaded creek if the pond is pressured."),
      roost: S(0, "Jumping the roost is how you ruin tomorrow and it scores nothing."),
    };
  }
  if (c.sky === "storm" || c.pressure === "falling") {
    return {
      sun: S(3, "Ahead of weather they feed hard. The sunflower edge, early."),
      bar: S(2, "A decoy spread on the bare bar next to the feed."),
      water: S(1, "Water is later, if the front hasn't already moved them."),
      creek: S(1, "Low crossings if the main field is crowded."),
      roost: S(0, "Still not the roost."),
    };
  }
  return {
    sun: S(3, "Ordinary September or October day. Pass-shoot the sunflower edge."),
    water: S(2, "The waterhole flight is the late backup."),
    bar: S(1, "Decoys help on a bare bar with a crosswind."),
    creek: S(1, "A creek funnel if you don't have a field."),
    roost: S(0, "Don't hunt the roost trees."),
  };
}

function dovePlays(c: Conditions): ScoreMap {
  if (c.windMph >= 12) {
    return {
      pass: S(3, "Wind makes them fly the line. Hide and pass-shoot. Don't over-call it."),
      decoy: S(2, "A few decoys on the bar tighten the same flight."),
      stubble: S(1, "Walking the stubble jumps singles. It's a slow way to a limit."),
      timber: S(0, "Sitting in the timber all day is not a dove hunt."),
      roost: S(0, "Roost-busting is the wrong play."),
    };
  }
  return {
    pass: S(3, "Find the line they already fly and sit it."),
    decoy: S(2, "Decoys on bare ground when the line is wide and sloppy."),
    stubble: S(1, "Walk the cut only to figure out where they want to be."),
    timber: S(0, "The timber hides you from doves that were never coming there."),
    roost: S(0, "Leave the roost."),
  };
}

function doveWindows(c: Conditions): ScoreMap {
  if (c.sky === "storm" || c.pressure === "falling") {
    return {
      morning: S(3, "They'll feed early ahead of the weather. Morning, not the usual late push."),
      afternoon: S(2, "Afternoon still works if the front is slow."),
      dusk: S(1, "Last light only if they haven't already gone to roost."),
      midday: S(0, "Midday they loaf. Let them."),
      night: S(0, "Doves are done at sunset."),
    };
  }
  return {
    afternoon: S(3, "The dove flight that fills a vest is late afternoon."),
    dusk: S(2, "Stay through the last half hour of light."),
    morning: S(1, "A morning feed exists. It's thinner than the evening flight."),
    midday: S(0, "Midday is shade and gravel. Leave them."),
    night: S(0, "After sunset you're done."),
  };
}

function squirrelSpots(c: Conditions): ScoreMap {
  if (c.windMph >= 14) {
    return {
      den: S(3, "Wind. They stay near the den trees. Sit one you already know."),
      hickory: S(2, "A hickory in a draw, out of the worst of it."),
      oak: S(1, "The open oak ridge is too loud to hear a cut nut."),
      bottom: S(1, "River-bottom walnuts if the ridge is howling."),
      pasture: S(0, "An open pasture has no squirrels and no trees worth the name."),
    };
  }
  if (c.tempF <= 45 && c.sky === "clear") {
    return {
      oak: S(3, "Cold, clear, still. Still-hunt the oak ridge after the frost."),
      hickory: S(2, "Hickory drains warm up later. Hunt them second."),
      bottom: S(1, "The bottom is the midday loaf."),
      den: S(1, "Den trees only if nothing is cutting on the ridge."),
      pasture: S(0, "No mast, no squirrels."),
    };
  }
  if (c.tempF >= 72) {
    return {
      bottom: S(3, "Warm. Early in the cool river bottom, then quit."),
      hickory: S(2, "A shaded hickory."),
      oak: S(1, "The ridge gets bright and they vanish."),
      den: S(1, "They'll be back at the den by mid-morning."),
      pasture: S(0, "Empty."),
    };
  }
  return {
    oak: S(3, "A still morning on the oak ridge. Listen for cuttings."),
    hickory: S(2, "The hickory drain if the oaks are quiet."),
    bottom: S(1, "Walnuts and pecans in the bottom as a second loop."),
    den: S(1, "A known den tree is a thirty-minute sit, not the whole hunt."),
    pasture: S(0, "Don't walk the pasture hoping."),
  };
}

function squirrelPlays(c: Conditions): ScoreMap {
  if (c.windMph >= 14) {
    return {
      sit: S(3, "You can't hear them walking. Sit a den tree and wait."),
      rest: S(2, "A rest and a .22, same tree, once one shows."),
      still: S(1, "Still-hunting in the wind means you walk under them."),
      call: S(0, "A call in the wind doesn't carry."),
      run: S(0, "Moving fast is how you see nothing."),
    };
  }
  return {
    still: S(3, "Slow still-hunt. Ten steps, look at the trunk, look at the ground for cuttings."),
    sit: S(2, "Sit when you hear one and can't see it."),
    rest: S(1, "The .22 from a rest is for the squirrel you already found."),
    call: S(1, "A soft call can finish a bark you can't place."),
    run: S(0, "If you're winded, you're too fast."),
  };
}

function squirrelWindows(c: Conditions): ScoreMap {
  if (c.tempF >= 70 && c.sky !== "storm") {
    return {
      dawn: S(3, "Warm days they feed early and quit. First two hours."),
      midmorning: S(2, "Be done by the time the woods goes quiet."),
      midday: S(1, "A second feed only if a cloud bank cools it off."),
      dusk: S(1, "A short dusk look near dens."),
      night: S(0, "Squirrels are in the hole."),
    };
  }
  if (c.tempF <= 45) {
    return {
      midmorning: S(3, "Cold. Let the sun hit the ridge, then hunt mid-morning."),
      dawn: S(2, "Dawn is slow until they come out to warm up."),
      midday: S(1, "They'll feed again when it's warmest."),
      dusk: S(0, "They den early."),
      night: S(0, "No."),
    };
  }
  return {
    dawn: S(3, "The first two hours after daylight."),
    midmorning: S(2, "Stay with it if cuttings are fresh."),
    midday: S(1, "A mild midday second feed, short."),
    dusk: S(1, "Last light near a den, half an hour."),
    night: S(0, "They're done."),
  };
}

function mallardSpots(c: Conditions): ScoreMap {
  if (c.pressure === "rising" && c.sky === "clear" && c.windMph < 8) {
    return {
      timber: S(3, "Bluebird and still. The few birds that move are in the timber, not on a sheet."),
      sheet: S(1, "A dry sheetwater flat under a high sky is a postcard."),
      bar: S(1, "A river bar might have a pair. Don't build a season on it."),
      ridge: S(0, "A dry ridge is not a duck hole."),
      fence: S(0, "If they're sitting on the refuge, leave the fence alone."),
    };
  }
  if (c.pressure === "falling" || c.windFrom === "N" || c.windFrom === "NW") {
    return {
      sheet: S(3, "North wind, glass falling. A sheetwater flat with room to land."),
      bar: S(2, "A river sandbar on the same wind, if the flat is frozen or crowded."),
      timber: S(1, "Timber if the flat ices or the wind howls too hard to keep decoys."),
      ridge: S(0, "Ducks are not on the ridge."),
      fence: S(0, "Don't crowd birds that have gone to the refuge."),
    };
  }
  if (c.ground === "flooded" || c.stage === "rising") {
    return {
      timber: S(3, "Water in the timber. That's the hole."),
      sheet: S(2, "New sheetwater over a low field, same idea."),
      bar: S(1, "The river bar is secondary once the bottoms flood."),
      ridge: S(0, "Walk the ridge and you'll be late to the hole."),
      fence: S(0, "Refuge birds stay refuge birds."),
    };
  }
  return {
    sheet: S(3, "Open water they can see decoys on. The sheetwater flat."),
    bar: S(2, "A sandbar spread if the flat is blown out."),
    timber: S(1, "Timber when the sun gets high and they leave the sheet."),
    ridge: S(0, "Wrong habitat."),
    fence: S(0, "Hunting the refuge line is how you ruin a marsh for everyone."),
  };
}

function mallardPlays(c: Conditions): ScoreMap {
  if (c.sky === "clear" && c.pressure === "rising" && c.windMph < 8) {
    return {
      scout: S(3, "Bluebird. Scout, note where they want to be, and hunt a different day if you can."),
      soft: S(2, "If you hunt, a small spread and a quiet call. Loud is wrong."),
      layout: S(1, "A layout on the X only if you watched them use it yesterday."),
      pass: S(0, "Pass-shooting empty sky is a walk."),
      loud: S(0, "A loud call on a bluebird sends the pair you had."),
    };
  }
  if (c.windMph >= 12) {
    return {
      layout: S(3, "Wind. Layout blind on the X, decoys tight, call only when they're looking."),
      soft: S(2, "A soft hail call, then nothing."),
      pass: S(1, "Pass-shooting works if they're decked too high for the spread."),
      scout: S(1, "You should already have scouted. Do it next time before the front."),
      loud: S(0, "High-volume calling in a wind sounds like a fight. They leave."),
    };
  }
  return {
    soft: S(3, "A decent spread and a call you can turn off. Feed chuckle, then quiet."),
    layout: S(2, "Get lower if the flat is bare."),
    pass: S(1, "Pass-shoot only the birds that won't look at the decoys."),
    scout: S(1, "Scouting is the right habit and the wrong use of this morning."),
    loud: S(0, "Calling every bird in the county educates all of them."),
  };
}

function mallardWindows(c: Conditions): ScoreMap {
  if (c.pressure === "rising" && c.sky === "clear") {
    return {
      last: S(3, "Bluebird. If anything moves, it's a last-light pair looking for a place to sit."),
      dawn: S(2, "Dawn is a look. Don't expect a volley."),
      morning: S(1, "Mid-morning they are where they're going to stay."),
      midday: S(0, "They're loafing. Leave them."),
      night: S(0, "After sunset you're done."),
    };
  }
  return {
    dawn: S(3, "First light. Be hidden before you can see the decoys."),
    morning: S(2, "The flight often runs an hour past sunrise on a front."),
    last: S(1, "Last light is a bonus, not the plan."),
    midday: S(0, "Midday loaf. Don't stir it."),
    night: S(0, "Legal light ends at sunset."),
  };
}

function turkeySpots(c: Conditions): ScoreMap {
  if (c.windMph >= 14) {
    return {
      creek: S(3, "Wind. Get off the ridge and into a creek bottom where a gobble can be heard."),
      field: S(2, "A field edge in the lee of the timber."),
      roost: S(1, "A roost ridge in this wind means you hear nothing and they fly the wrong way."),
      pasture: S(0, "The middle of a pasture in a wind is a place to be seen."),
      thick: S(0, "A deer thicket is not a turkey travel route."),
    };
  }
  if (c.sky === "clear" && c.pressure === "rising") {
    return {
      roost: S(3, "Clear and still enough. Be under the roost before fly-down, not on top of them."),
      field: S(2, "If they pitch to a field, the edge is the second setup."),
      creek: S(1, "The creek bottom is where they go late morning."),
      pasture: S(0, "Don't stand in the open and yelp."),
      thick: S(0, "They aren't in the thicket."),
    };
  }
  if (c.sky === "overcast" || c.pressure === "falling") {
    return {
      field: S(3, "Gray day. They'll pitch down and strut where they can see. Field edge."),
      creek: S(2, "A travel crease between roost and field."),
      roost: S(1, "Still listen at the roost. Don't expect a hot fly-down."),
      pasture: S(0, "Too exposed, no edge."),
      thick: S(0, "Wrong cover."),
    };
  }
  return {
    roost: S(3, "Start where they slept. A ridge you can hear, with room to back off."),
    field: S(2, "The strutting field they pitch toward."),
    creek: S(1, "Mid-morning travel in the creek bottom."),
    pasture: S(0, "Open pasture with no edge is a good way to be sky-lined."),
    thick: S(0, "If you're hunting it like a deer, you're in the wrong cover."),
  };
}

function turkeyPlays(c: Conditions): ScoreMap {
  if (c.windMph >= 14) {
    return {
      cut: S(3, "Wind. Move, cut the distance, soft calls. They won't cross a noisy hollow."),
      blind: S(2, "A blind on the lee edge if you know the field."),
      roost: S(1, "A roost setup only if you can hear them at all."),
      jake: S(0, "An aggressive jake decoy in the wind gets ignored or flares them."),
      chase: S(0, "Chasing a gobble you can barely hear is how you bump the flock."),
    };
  }
  if (c.month === 4 && c.tempF >= 60 && c.sky !== "storm") {
    return {
      jake: S(3, "Late season, pressured birds. A jake decoy and a hen, set where he can see it coming."),
      blind: S(2, "The blind on the strut zone if decoys are too much."),
      roost: S(1, "They may not gobble on the limb. Have a second plan."),
      cut: S(1, "Cut them off only after they fly down quiet."),
      chase: S(0, "Running at a gobble is the classic way to educate a tom."),
    };
  }
  return {
    roost: S(3, "Soft tree yelps, then let him pitch your direction. Don't over-call."),
    cut: S(2, "If he flies the other way, cut the distance once and reset."),
    blind: S(1, "A blind is for a bird that already uses a field."),
    jake: S(1, "A decoy helps a bird that's already coming, not a cold start."),
    chase: S(0, "Chasing the gobble bumps him. Set up and call him to you."),
  };
}

function turkeyWindows(c: Conditions): ScoreMap {
  if (c.sky === "clear" && c.windMph <= 8) {
    return {
      fly: S(3, "Clear and still. Fly-down is the whole hunt."),
      morning: S(2, "If he hangs up, mid-morning is the second chance."),
      midday: S(1, "A quiet midday yelp in the shade can work late in the season."),
      afternoon: S(1, "Afternoon birds exist. They're a bonus."),
      night: S(0, "Off the roost and out of the woods at the end of legal light. Don't roost-shoot."),
    };
  }
  if (c.sky === "overcast" || c.windMph >= 10) {
    return {
      morning: S(3, "Gray or breezy. They gobble later. Mid-morning, not a heroic pre-dawn."),
      fly: S(2, "Still be out there for fly-down. Just don't expect a chorus."),
      midday: S(1, "They'll shock-gobble later than you think."),
      afternoon: S(1, "An afternoon loop if the morning was silent."),
      night: S(0, "Not at night."),
    };
  }
  return {
    fly: S(3, "Be set before they fly down."),
    morning: S(2, "Hunt through mid-morning before you quit."),
    midday: S(1, "A slow midday only if you're still hearing a bird."),
    afternoon: S(1, "Late season, an afternoon strut is real."),
    night: S(0, "Roost shooting isn't hunting. It also isn't legal."),
  };
}

const WINDOWS: Option[] = [
  spot("dusk", "Dusk into dark", "Be set before the sun leaves and stay a while.", "the late handoff"),
  spot("night", "Full dark", "After the bank goes black.", "after the lights are out"),
  spot("dawn", "First light", "The hour the sun actually shows up.", "the start of the day"),
  spot("morning", "Mid-morning", "A couple of hours after sunrise.", "after the rush"),
  spot("midday", "Midday", "High sun, warmest hour.", "the middle of the day"),
];

const DEER_WINDOWS: Option[] = [
  spot("dawn", "Dawn, first light", "In the tree before you can see the pin.", "the first legal minutes"),
  spot("midmorning", "Mid-morning", "The hour after the dawn rush.", "after sunrise settles"),
  spot("midday", "Midday", "High sun in the bedding cover or the field.", "the middle hours"),
  spot("last", "Last light", "The last hour before the end of shooting light.", "the end of the day"),
  spot("midnight", "After dark", "A night sit under the moon.", "when you should be home"),
];

const DOVE_WINDOWS: Option[] = [
  spot("morning", "Morning feed", "The early flight off the roost to the field.", "the early flight"),
  spot("midday", "Midday loaf", "Shade, gravel, and birds that don't want you.", "the loaf"),
  spot("afternoon", "Late afternoon flight", "The push everyone waits for.", "the late push"),
  spot("dusk", "Last half hour", "The end of legal light.", "the last of the light"),
  spot("night", "After sunset", "Birds in the roost trees.", "too late"),
];

const SQUIRREL_WINDOWS: Option[] = [
  spot("dawn", "First two hours", "From daylight until the woods goes quiet.", "the early feed"),
  spot("midmorning", "Mid-morning", "After the sun is on the ridge.", "once the ridge warms"),
  spot("midday", "Midday", "The second feed, if there is one.", "the warm hour"),
  spot("dusk", "Last light", "A short sit near a den.", "the short evening"),
  spot("night", "After dark", "They're in the hole.", "the hole"),
];

const DUCK_WINDOWS: Option[] = [
  spot("dawn", "First light", "Hidden before you can see your own decoys.", "before you can see"),
  spot("morning", "The hour after", "The flight that runs past sunrise.", "just after sunrise"),
  spot("midday", "Midday loaf", "Birds that have already sat down.", "the loaf"),
  spot("last", "Last light", "A late pair looking for a place.", "the late pair"),
  spot("night", "After sunset", "Past legal light.", "past the end"),
];

const TURKEY_WINDOWS: Option[] = [
  spot("fly", "Fly-down", "Set before they pitch off the limb.", "when they pitch down"),
  spot("morning", "Mid-morning", "After the fly-down, before noon.", "later in the morning"),
  spot("midday", "Midday", "A quiet yelp when the woods has gone still.", "the quiet middle"),
  spot("afternoon", "Afternoon", "A late strut or a shock call.", "the late day"),
  spot("night", "On the roost at night", "After they fly up.", "after fly-up"),
];

export const QUARRIES: Quarry[] = [
  {
    id: "channel",
    name: "Channel cat",
    kind: "fish",
    spots: [
      spot("slack", "Slack below a feeder", "The soft water where a creek dumps in.", "soft water off the current"),
      spot("hole", "Outside-bend hole", "The deep bend, bait on the bottom.", "the deep bend"),
      spot("dike", "Wing-dike eddy", "The cushion behind a rock dike.", "the cushion behind the rock"),
      spot("sandbar", "Shallow sandbar", "Skinny water on the inside.", "the skinny bar"),
      spot("seam", "Main-current seam", "The walking-speed edge of the channel.", "the fast side of the seam"),
    ],
    plays: [
      spot("dip", "Dip bait", "Prepared bait that stains the water around it.", "something that stains the eddy"),
      spot("cut", "Cut shad", "Fresh cut bait on the bottom.", "fresh and bloody"),
      spot("live", "Live bluegill", "A lively baitfish on a slip sinker.", "something that kicks"),
      spot("crawler", "Nightcrawler", "A worm under a small weight.", "the simple worm"),
      spot("plug", "Topwater plug", "A walking bait over the hole.", "on the surface"),
    ],
    windows: WINDOWS,
    scoreSpots: channelSpots,
    scorePlays: channelPlays,
    scoreWindows: channelWindows,
  },
  {
    id: "smallmouth",
    name: "Smallmouth",
    kind: "fish",
    spots: [
      spot("shoal", "Rocky shoal", "Crawfish rock in two to four feet.", "the rocks"),
      spot("eddy", "Bank eddy", "Slack against the bank, out of the push.", "out of the push"),
      spot("pool", "Pool tailout", "The deep slow water at the end of a run.", "the deep slow tail"),
      spot("riffle", "Riffle head", "The fast lip where the pool shallows.", "the fast lip"),
      spot("grass", "Grass flat", "Soft weeds, more lake than river.", "the weeds"),
    ],
    plays: [
      spot("jig", "Craw jig", "A small jig dragged on the rock.", "something that looks like a craw"),
      spot("grub", "Dark grub", "A small soft plastic they find by feel.", "small and dark"),
      spot("top", "Topwater", "A walking bait over the shoal.", "on top"),
      spot("minnow", "Live minnow", "A baitfish on a light jig head.", "a real minnow"),
      spot("spin", "Big spinnerbait", "A heavy thumping blade.", "too much hardware"),
    ],
    windows: WINDOWS,
    scoreSpots: smallmouthSpots,
    scorePlays: smallmouthPlays,
    scoreWindows: smallmouthWindows,
  },
  {
    id: "crappie",
    name: "Crappie",
    kind: "fish",
    spots: [
      spot("brush", "Brush in 8–12 feet", "A pile you can hover over.", "the mid-depth pile"),
      spot("windward", "Windward wood", "Cover on the bank the wind is hitting.", "where the wind stacks bait"),
      spot("ledge", "Channel ledge", "The drop into the old river channel.", "the drop"),
      spot("flat", "Shallow flat", "Skinny water with a little brush.", "the skinny flat"),
      spot("open", "Open water", "Nothing but a trolling pass.", "nowhere to hide"),
    ],
    plays: [
      spot("minnow", "Minnow under a float", "A slip float set just over the cover.", "a float and a minnow"),
      spot("jig", "Small jig, vertical", "A 1/16 ounce jig held in the wood.", "straight down"),
      spot("troll", "Trolling a jig", "Cover water until a rod loads.", "covering water"),
      spot("bug", "Topwater bug", "A popper on a fly rod.", "the surface bug"),
      spot("crank", "Crankbait", "A bass-sized crank, reeled steady.", "a bass crank"),
    ],
    windows: WINDOWS,
    scoreSpots: crappieSpots,
    scorePlays: crappiePlays,
    scoreWindows: crappieWindows,
  },
  {
    id: "largemouth",
    name: "Largemouth",
    kind: "fish",
    spots: [
      spot("flat", "Wind-blown flat", "A shallow flat with the wind in its face.", "where the wind hits"),
      spot("timber", "Timber point", "Laydowns on a point into the backwater.", "the wood on the point"),
      spot("pocket", "Muddy pocket", "A soft pocket out of the current.", "the soft pocket"),
      spot("ledge", "River ledge", "The drop into deeper water.", "the deeper swing"),
      spot("pads", "Pad edge", "Shade under the lilies.", "the shade under the pads"),
    ],
    plays: [
      spot("top", "Buzzbait", "A topwater bait they can track.", "on the surface"),
      spot("spin", "Spinnerbait", "A single blade, slow-rolled.", "a blade they can find"),
      spot("jig", "Jig in the wood", "Black and blue, crawled.", "in the cover"),
      spot("drop", "Drop shot", "A finesse worm held off the bottom.", "small and watched"),
      spot("dough", "Dough bait", "Catfish bait on a bass rod.", "the wrong bait"),
    ],
    windows: WINDOWS,
    scoreSpots: largemouthSpots,
    scorePlays: largemouthPlays,
    scoreWindows: largemouthWindows,
  },
  {
    id: "flathead",
    name: "Flathead",
    kind: "fish",
    spots: [
      spot("jam", "Logjam", "Wood in a seam, with a hole under it.", "the wood"),
      spot("bend", "Deep outside bend", "The deepest water in the stretch.", "the deep bend"),
      spot("riprap", "Riprap bank", "Rock that dumps into deeper water.", "the rock"),
      spot("riffle", "Shallow riffle", "Fast skinny water.", "too fast and too thin"),
      spot("mouth", "Creek mouth", "Where a feeder meets the river.", "the feeder"),
    ],
    plays: [
      spot("live", "Live bluegill", "A sunfish on a slip sinker, left alone.", "a live sunfish"),
      spot("cut", "Cut bait", "Shad or skipjack on the bottom.", "cut bait"),
      spot("swim", "Big swimbait", "A heavy paddle tail through the wood.", "a big artificial"),
      spot("frog", "Frog jig", "A frog-colored jig at the surface.", "a frog"),
      spot("worm", "Nightcrawler", "A worm and a bell sinker.", "a worm"),
    ],
    windows: WINDOWS,
    scoreSpots: flatheadSpots,
    scorePlays: flatheadPlays,
    scoreWindows: flatheadWindows,
  },
  {
    id: "whitetail",
    name: "Whitetail",
    kind: "hunt",
    spots: [
      spot("ridge", "South-slope oak ridge", "Acorns, a stand tree, wind that has to behave.", "the acorn slope"),
      spot("bottom", "Creek-bottom edge", "Food and cover where the air stays cooler.", "the low edge"),
      spot("cedar", "Cedar thicket", "Bedding cover you only enter on purpose.", "the thick cover"),
      spot("cut", "Open cut at noon", "A field with no edge to hide your outline.", "the open field"),
      spot("bench", "River-hill bench", "A sidehill trail out of the worst wind.", "the sidehill"),
    ],
    plays: [
      spot("stand", "Stand, wind in your face", "Climb in, shut up, let the trail work.", "sit it out"),
      spot("still", "Still-hunt the thicket", "Ten steps, glass, repeat.", "slow through the cover"),
      spot("rattle", "Rattle and grunt", "Horns on the ridge, then silence.", "make a little noise"),
      spot("noon", "Sit the field at noon", "A field edge in the high sun.", "the midday field"),
      spot("stalk", "Spot and stalk", "A deer you can see, a route that keeps the wind.", "a deer you already see"),
    ],
    windows: DEER_WINDOWS,
    scoreSpots: deerSpots,
    scorePlays: deerPlays,
    scoreWindows: deerWindows,
  },
  {
    id: "dove",
    name: "Mourning dove",
    kind: "hunt",
    spots: [
      spot("sun", "Sunflower edge", "The pass between feed and wherever they came from.", "the feed edge"),
      spot("water", "Waterhole flight", "The line into the pond, not the pond itself.", "where they water"),
      spot("bar", "Bare bar with decoys", "Open dirt, a few shells, a stool that hides you.", "the bare dirt"),
      spot("creek", "Creek crossing", "A low funnel if you don't have a field.", "the narrow funnel"),
      spot("roost", "Roost trees at midday", "The trees they use when they're done flying.", "where they sleep"),
    ],
    plays: [
      spot("pass", "Pass the flight line", "Hide on the line they already use.", "let them come"),
      spot("decoy", "A small decoy spread", "Shells on bare ground to tighten a wide flight.", "show them company"),
      spot("stubble", "Walk the stubble", "Jump singles and learn the field.", "on your feet"),
      spot("timber", "Sit the timber all day", "Shade, and birds that aren't coming.", "waiting in the trees"),
      spot("roost", "Jump the roost", "Walk the trees they use at night.", "the roost"),
    ],
    windows: DOVE_WINDOWS,
    scoreSpots: doveSpots,
    scorePlays: dovePlays,
    scoreWindows: doveWindows,
  },
  {
    id: "squirrel",
    name: "Fox squirrel",
    kind: "hunt",
    spots: [
      spot("oak", "Oak ridge", "Mast on the ground, trees you can see into.", "the mast ridge"),
      spot("hickory", "Hickory drain", "A draw that holds sound and shade.", "the shaded draw"),
      spot("den", "Den woods", "Trees with holes, out of the wind.", "the den trees"),
      spot("pasture", "Open pasture", "Fence posts and no mast.", "the open grass"),
      spot("bottom", "River-bottom walnuts", "Bigger trees, later light.", "the bottom timber"),
    ],
    plays: [
      spot("still", "Still-hunt slow", "Steps, then a long look at trunks and cuttings.", "slow and quiet"),
      spot("sit", "Sit a feeding tree", "When you hear one and can't place it.", "wait it out"),
      spot("run", "Move fast and hope", "Cover ground, miss the cuttings.", "too quick"),
      spot("rest", ".22 from a rest", "A shot you only take once you've found the squirrel.", "a rested shot"),
      spot("call", "A soft call", "For a bark you can hear and not see.", "a little call"),
    ],
    windows: SQUIRREL_WINDOWS,
    scoreSpots: squirrelSpots,
    scorePlays: squirrelPlays,
    scoreWindows: squirrelWindows,
  },
  {
    id: "mallard",
    name: "Mallard",
    kind: "hunt",
    spots: [
      spot("sheet", "Sheetwater flat", "Shallow water they can see a spread on.", "water they can land on"),
      spot("bar", "River sandbar", "An open bar with room to set decoys.", "the bar"),
      spot("timber", "Timber hole", "Flooded trees, tighter spread, shorter shots.", "in the trees"),
      spot("ridge", "Dry ridge", "Oak leaves and no water.", "the dry woods"),
      spot("fence", "Refuge fence", "Birds that have already quit for the day, on the wrong side of a line.", "birds you should leave"),
    ],
    plays: [
      spot("soft", "Small spread, soft call", "Enough decoys to look alive, then stop calling.", "quiet"),
      spot("layout", "Layout on the X", "Low on the spot you watched them use.", "low on the X"),
      spot("pass", "Pass, no decoys", "Shoot the line and hope.", "no decoys"),
      spot("scout", "Scout and wait", "Mark the hole. Hunt it when the sky agrees.", "watch first"),
      spot("loud", "Loud call all morning", "Hail every bird until none of them look.", "too much calling"),
    ],
    windows: DUCK_WINDOWS,
    scoreSpots: mallardSpots,
    scorePlays: mallardPlays,
    scoreWindows: mallardWindows,
  },
  {
    id: "turkey",
    name: "Spring turkey",
    kind: "hunt",
    spots: [
      spot("roost", "Roost ridge", "Close enough to hear, far enough not to bump the fly-down.", "where they slept"),
      spot("field", "Strutting-field edge", "The timber side of a field they pitch into.", "the field edge"),
      spot("creek", "Creek-bottom travel", "The crease they walk after fly-down.", "the travel crease"),
      spot("pasture", "Middle of the pasture", "Sky-lined, no edge.", "too open"),
      spot("thick", "Deer thicket", "Cover a tom doesn't strut in.", "the wrong thicket"),
    ],
    plays: [
      spot("roost", "Soft tree yelps", "A little calling on the limb, then let him work.", "soft, then quiet"),
      spot("cut", "Move once and reset", "If he flies the other way, cut the distance a single time.", "one move"),
      spot("blind", "Blind on the strut zone", "Already set, already hidden, on a field he uses.", "already hidden"),
      spot("jake", "Jake and a hen decoy", "Something for him to walk in on and dislike.", "a decoy he can see"),
      spot("chase", "Chase the gobble", "Run at the sound until you bump him.", "running at him"),
    ],
    windows: TURKEY_WINDOWS,
    scoreSpots: turkeySpots,
    scorePlays: turkeyPlays,
    scoreWindows: turkeyWindows,
  },
];

export const QUARRY_BY_ID: Record<string, Quarry> = Object.fromEntries(
  QUARRIES.map((quarry) => [quarry.id, quarry]),
);

export const MONTH_POOL: Record<number, string[]> = {
  1: ["whitetail", "mallard", "crappie", "channel"],
  2: ["mallard", "crappie", "channel", "squirrel"],
  3: ["turkey", "crappie", "smallmouth", "channel"],
  4: ["turkey", "crappie", "smallmouth", "largemouth"],
  5: ["turkey", "smallmouth", "largemouth", "channel"],
  6: ["largemouth", "channel", "smallmouth", "flathead"],
  7: ["largemouth", "flathead", "channel", "smallmouth"],
  8: ["largemouth", "flathead", "smallmouth", "channel"],
  9: ["dove", "largemouth", "channel", "squirrel"],
  10: ["whitetail", "dove", "channel", "squirrel", "crappie"],
  11: ["whitetail", "mallard", "squirrel", "crappie", "channel"],
  12: ["whitetail", "mallard", "crappie", "channel"],
};

export const FISH_PLACES = [
  "the Gasconade below Hermann",
  "a Missouri River wing dike",
  "the mouth of the Loutre",
  "an Osage eddy near Bonnots Mill",
  "a backwater behind the river hills",
];

export const HUNT_PLACES = [
  "the ridge north of Hermann",
  "Danville timber",
  "a bench under Grand Bluffs",
  "river hills above the Katy",
  "a creek bottom off the river road",
];
