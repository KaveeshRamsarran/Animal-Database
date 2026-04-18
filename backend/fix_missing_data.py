"""Fix missing images and diet/predation data for all animals."""
import asyncio
import urllib.request
import urllib.parse
import json
import time
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, update, func
from app.db.base_all import Base
from app.core.config import get_settings
from app.models.animal import Animal
from app.models.image import Image
from app.models.continent import Continent
from app.models.conservation import ConservationStatus
from app.models.behavior import Behavior
from app.models.country import Country
from app.models.occurrence import Occurrence
from app.models.fact import Fact
from app.models.user import User

settings = get_settings()

# Diet/predation data for animals that need it
DIET_PREDATION_DATA = {
    "aardvark": {"diet": "Insectivore", "diet_detail": "Feeds almost exclusively on ants and termites, using its long sticky tongue to collect them from mounds. Can eat up to 50,000 insects in a single night.", "prey": "Ants, termites, insect larvae", "predators": "Lions, leopards, hyenas, pythons"},
    "aardwolf": {"diet": "Insectivore", "diet_detail": "Specializes in eating harvester termites, consuming up to 300,000 termites per night using its broad, sticky tongue.", "prey": "Termites, insect larvae", "predators": "Jackals, lions, leopards"},
    "nine-banded-armadillo": {"diet": "Omnivore", "diet_detail": "Primarily insectivorous, digging for beetles, ants, and grubs. Also eats small vertebrates, eggs, fruits, and fungi.", "prey": "Insects, grubs, beetles, ants, small vertebrates, eggs", "predators": "Coyotes, bobcats, cougars, bears, raptors"},
    "olive-baboon": {"diet": "Omnivore", "diet_detail": "Highly adaptable diet including fruits, grasses, seeds, bark, roots, insects, and occasionally small mammals and birds.", "prey": "Fruits, seeds, insects, small mammals, birds", "predators": "Leopards, lions, hyenas, crocodiles, large eagles"},
    "european-badger": {"diet": "Omnivore", "diet_detail": "Earthworms are the staple food, supplemented by insects, small mammals, fruits, cereals, and bulbs.", "prey": "Earthworms, insects, rabbits, rodents, fruits, cereals", "predators": "Wolves, lynx, bears, golden eagles"},
    "north-american-beaver": {"diet": "Herbivore", "diet_detail": "Feeds on bark, cambium, and leaves of trees like aspen, willow, and birch. Also eats aquatic plants, grasses, and sedges.", "prey": "Tree bark, leaves, aquatic plants, grasses", "predators": "Wolves, coyotes, bears, wolverines, lynx"},
    "beluga-whale": {"diet": "Carnivore", "diet_detail": "Feeds on fish including salmon, herring, and arctic cod, as well as shrimp, crabs, clams, and marine worms.", "prey": "Salmon, herring, arctic cod, shrimp, crabs, clams", "predators": "Polar bears, orcas"},
    "black-rhinoceros": {"diet": "Herbivore", "diet_detail": "A browser that uses its prehensile lip to grasp leaves, shoots, and branches from woody plants and shrubs.", "prey": "Leaves, shoots, branches, thorny bushes, fruits", "predators": "No natural predators as adults; calves vulnerable to lions, hyenas, crocodiles"},
    "bobcat": {"diet": "Carnivore", "diet_detail": "An ambush predator feeding primarily on rabbits and hares, but also takes rodents, birds, deer fawns, and small reptiles.", "prey": "Rabbits, hares, rodents, birds, deer fawns", "predators": "Cougars, wolves, coyotes, great horned owls"},
    "bonobo": {"diet": "Omnivore", "diet_detail": "Primarily frugivorous, with fruit making up about half the diet. Also eats leaves, honey, eggs, insects, and occasionally small mammals.", "prey": "Fruits, leaves, honey, insects, small mammals", "predators": "Humans, possibly leopards"},
    "cape-buffalo": {"diet": "Herbivore", "diet_detail": "Grazes on tall, coarse grasses and also feeds on herbs and browse near water sources.", "prey": "Grasses, herbs, shrubs", "predators": "Lions (in groups), crocodiles, leopards (calves only)"},
    "caracal": {"diet": "Carnivore", "diet_detail": "A skilled hunter known for leaping to catch birds mid-flight. Also hunts rodents, hares, small antelopes, and reptiles.", "prey": "Birds, rodents, hares, small antelopes, reptiles", "predators": "Lions, leopards, hyenas"},
    "caribou": {"diet": "Herbivore", "diet_detail": "Feeds on lichens (especially reindeer moss) in winter and grasses, sedges, and willow leaves in summer.", "prey": "Lichens, grasses, sedges, willow leaves, mushrooms", "predators": "Wolves, bears, wolverines, golden eagles (calves)"},
    "chinchilla": {"diet": "Herbivore", "diet_detail": "Feeds on grasses, seeds, bark, and various plant matter found in the high Andes.", "prey": "Grasses, seeds, bark, fruits, plant matter", "predators": "Hawks, eagles, foxes, snakes, skunks"},
    "clouded-leopard": {"diet": "Carnivore", "diet_detail": "Hunts primates, deer, porcupines, birds, and wild boar. Has proportionally the longest canine teeth of any cat.", "prey": "Primates, deer, porcupines, birds, wild boar", "predators": "Tigers, leopards"},
    "coati": {"diet": "Omnivore", "diet_detail": "Uses its long flexible snout to forage for insects, spiders, and small vertebrates on the ground and fruit in trees.", "prey": "Insects, spiders, fruit, small vertebrates, eggs", "predators": "Jaguars, ocelots, large raptors, boas"},
    "coyote": {"diet": "Omnivore", "diet_detail": "Extremely adaptable, eating rabbits, rodents, deer, insects, fruits, and even garbage in urban areas.", "prey": "Rabbits, rodents, deer, insects, fruits, carrion", "predators": "Wolves, cougars, bears, golden eagles"},
    "dhole": {"diet": "Carnivore", "diet_detail": "Pack hunters that pursue medium to large ungulates including deer, wild boar, and water buffalo.", "prey": "Deer, wild boar, water buffalo, hares", "predators": "Tigers, leopards"},
    "dingo": {"diet": "Carnivore", "diet_detail": "Hunts kangaroos, wallabies, rabbits, and rodents. Also eats birds, reptiles, insects, and fruits.", "prey": "Kangaroos, wallabies, rabbits, rodents, birds", "predators": "Crocodiles, wedge-tailed eagles"},
    "dromedary-camel": {"diet": "Herbivore", "diet_detail": "Feeds on thorny desert plants, dry grasses, and salty vegetation that other animals avoid.", "prey": "Thorny plants, dry grasses, leaves, seeds", "predators": "Wolves, lions (historically)"},
    "dugong": {"diet": "Herbivore", "diet_detail": "Grazes on seagrass meadows, uprooting entire plants. Can eat up to 40 kg of seagrass daily.", "prey": "Seagrass, algae", "predators": "Sharks, crocodiles, orcas"},
    "elk": {"diet": "Herbivore", "diet_detail": "Grazes on grasses and forbs in summer; browses on shrubs, bark, and tree sprouts in winter.", "prey": "Grasses, forbs, bark, shrubs, tree sprouts", "predators": "Wolves, bears, cougars, coyotes (calves)"},
    "fennec-fox": {"diet": "Omnivore", "diet_detail": "Hunts insects, small rodents, and lizards at night. Also eats fruits, roots, and eggs.", "prey": "Insects, rodents, lizards, eggs, fruits", "predators": "Eagle owls, jackals, hyenas"},
    "fossa": {"diet": "Carnivore", "diet_detail": "The top predator in Madagascar, specializing in hunting lemurs. Also eats tenrecs, reptiles, and birds.", "prey": "Lemurs, tenrecs, reptiles, birds, frogs", "predators": "Nile crocodiles, humans"},
    "flying-fox": {"diet": "Herbivore", "diet_detail": "Feeds primarily on fruit, nectar, and pollen, playing a crucial role in pollination and seed dispersal.", "prey": "Fruit, nectar, pollen, flowers", "predators": "Eagles, pythons, crocodiles"},
    "gelada": {"diet": "Herbivore", "diet_detail": "The only primate that feeds primarily on grass, spending most of its time plucking grass blades and digging for roots.", "prey": "Grass, seeds, roots, herbs, insects", "predators": "Leopards, hyenas, jackals, eagles"},
    "giant-otter": {"diet": "Carnivore", "diet_detail": "Hunts fish cooperatively in family groups, consuming 3-4 kg of fish daily. Also eats crabs and small caimans.", "prey": "Fish, crabs, small caimans, snakes", "predators": "Jaguars, large caimans"},
    "lar-gibbon": {"diet": "Omnivore", "diet_detail": "Primarily frugivorous, spending most feeding time on ripe fruits. Also eats young leaves, flowers, and insects.", "prey": "Fruits, leaves, flowers, insects", "predators": "Leopards, pythons, eagles"},
    "golden-lion-tamarin": {"diet": "Omnivore", "diet_detail": "Uses its long fingers to probe bark and bromeliads for insects and spiders. Also eats fruits, nectar, and small vertebrates.", "prey": "Insects, spiders, fruits, nectar, small lizards", "predators": "Hawks, eagles, snakes, wild cats"},
    "harp-seal": {"diet": "Carnivore", "diet_detail": "Feeds on a variety of fish including herring, capelin, and cod, as well as crustaceans.", "prey": "Herring, capelin, cod, shrimp, crustaceans", "predators": "Polar bears, orcas, sharks, walruses"},
    "howler-monkey": {"diet": "Herbivore", "diet_detail": "Feeds primarily on leaves, supplemented by fruits, flowers, and nuts. Their specialized digestive system can process tough leaves.", "prey": "Leaves, fruits, flowers, nuts", "predators": "Harpy eagles, jaguars, ocelots, snakes"},
    "alpine-ibex": {"diet": "Herbivore", "diet_detail": "Grazes on grasses, herbs, and mosses in alpine meadows. Remarkably agile on steep rocky terrain to access food.", "prey": "Grasses, herbs, mosses, shrubs, lichens", "predators": "Wolves, lynx, golden eagles (young), bears"},
    "impala": {"diet": "Herbivore", "diet_detail": "Both a grazer and a browser, switching between grass and shrubs depending on season and availability.", "prey": "Grasses, herbs, leaves, shrubs, seeds", "predators": "Leopards, cheetahs, lions, wild dogs, hyenas, crocodiles"},
    "golden-jackal": {"diet": "Omnivore", "diet_detail": "Opportunistic feeder eating rodents, hares, birds, insects, fruits, and carrion. Often scavenges from larger predators.", "prey": "Rodents, hares, birds, insects, fruits, carrion", "predators": "Wolves, leopards, tigers"},
    "ring-tailed-lemur": {"diet": "Omnivore", "diet_detail": "Feeds on fruits, leaves, flowers, bark, and sap. Also eats insects, small vertebrates, and bird eggs.", "prey": "Fruits, leaves, flowers, insects, spiders", "predators": "Fossa, Madagascar harrier-hawk, Madagascar ground boa"},
    "leopard": {"diet": "Carnivore", "diet_detail": "An incredibly adaptable hunter taking prey from insects to large antelopes. Famously drags kills into trees to avoid scavengers.", "prey": "Antelopes, deer, monkeys, rodents, birds, fish", "predators": "Lions, tigers, hyena clans"},
    "manatee": {"diet": "Herbivore", "diet_detail": "Grazes on seagrasses, freshwater plants, and algae for 6-8 hours daily, consuming about 10% of body weight.", "prey": "Seagrass, freshwater plants, algae", "predators": "No significant natural predators; occasionally sharks or alligators"},
    "maned-wolf": {"diet": "Omnivore", "diet_detail": "Unlike most canids, the maned wolf is heavily omnivorous. The lobeira fruit makes up over 50% of its diet.", "prey": "Lobeira fruit, small mammals, birds, insects, fish", "predators": "No natural predators; occasionally domestic dogs"},
    "alpine-marmot": {"diet": "Herbivore", "diet_detail": "Feeds on grasses, herbs, flowers, and seeds in alpine meadows. Builds up extensive fat reserves before hibernation.", "prey": "Grasses, herbs, flowers, seeds, roots", "predators": "Golden eagles, foxes, wolves, bears"},
    "egyptian-mongoose": {"diet": "Carnivore", "diet_detail": "Feeds on rodents, snakes, birds, eggs, insects, and crabs. Famous for its ability to kill venomous snakes.", "prey": "Rodents, snakes, birds, eggs, insects, crabs", "predators": "Eagles, jackals, large snakes"},
    "mountain-goat": {"diet": "Herbivore", "diet_detail": "Feeds on grasses, herbs, sedges, ferns, mosses, and lichens found at high elevations.", "prey": "Grasses, herbs, sedges, mosses, lichens, shrubs", "predators": "Mountain lions, wolves, bears, golden eagles (kids)"},
    "musk-ox": {"diet": "Herbivore", "diet_detail": "Grazes on grasses, willows, and other arctic plants. Digs through snow with hooves to reach buried vegetation.", "prey": "Grasses, willows, arctic flowers, mosses, lichens", "predators": "Arctic wolves, polar bears, grizzly bears"},
    "naked-mole-rat": {"diet": "Herbivore", "diet_detail": "Feeds on underground tubers and roots, which also provide all needed moisture. Lives in cooperative colonies like social insects.", "prey": "Tubers, roots, bulbs", "predators": "Snakes, raptors (when above ground)"},
    "narwhal": {"diet": "Carnivore", "diet_detail": "Feeds on Arctic cod, Greenland halibut, shrimp, and squid. Dives to depths over 1,500 meters to hunt.", "prey": "Arctic cod, halibut, shrimp, squid", "predators": "Polar bears, orcas, walruses"},
    "numbat": {"diet": "Insectivore", "diet_detail": "Feeds almost exclusively on termites, eating up to 20,000 per day using its long, sticky tongue.", "prey": "Termites, ants", "predators": "Foxes, cats, raptors, carpet pythons"},
    "ocelot": {"diet": "Carnivore", "diet_detail": "Hunts rodents, rabbits, iguanas, fish, frogs, monkeys, and birds. Primarily nocturnal and solitary.", "prey": "Rodents, rabbits, iguanas, fish, monkeys, birds", "predators": "Jaguars, pumas, harpy eagles, anacondas"},
    "okapi": {"diet": "Herbivore", "diet_detail": "Feeds on tree leaves, buds, grasses, ferns, fungi, and fruits using its long prehensile tongue.", "prey": "Leaves, buds, grasses, ferns, fruits, fungi", "predators": "Leopards"},
    "sunda-pangolin": {"diet": "Insectivore", "diet_detail": "Feeds exclusively on ants and termites, using its extraordinarily long sticky tongue to extract them from nests.", "prey": "Ants, termites", "predators": "Tigers, leopards, pythons"},
    "american-pika": {"diet": "Herbivore", "diet_detail": "Gathers grasses, wildflowers, and weeds into hay piles on rocky slopes to dry and store for winter.", "prey": "Grasses, wildflowers, weeds, thistles, fireweed", "predators": "Weasels, hawks, eagles, coyotes, martens"},
    "pine-marten": {"diet": "Omnivore", "diet_detail": "Hunts voles, squirrels, birds, and insects. Supplements diet with berries, nuts, and honey.", "prey": "Voles, squirrels, birds, insects, berries, honey", "predators": "Golden eagles, foxes, wildcats"},
    "north-american-porcupine": {"diet": "Herbivore", "diet_detail": "Feeds on bark, stems, and leaves of trees. In winter relies heavily on the inner bark of pines and hemlocks.", "prey": "Bark, leaves, stems, fruits, nuts", "predators": "Fishers, coyotes, wolverines, great horned owls"},
    "prairie-dog": {"diet": "Herbivore", "diet_detail": "Feeds on grasses, roots, seeds, and occasionally insects. Their grazing maintains shortgrass prairie ecosystems.", "prey": "Grasses, roots, seeds, weeds, insects", "predators": "Black-footed ferrets, coyotes, hawks, eagles, rattlesnakes, badgers"},
    "pronghorn": {"diet": "Herbivore", "diet_detail": "Feeds on forbs, shrubs, grasses, and cacti. Can survive on sagebrush when other food is scarce.", "prey": "Forbs, sagebrush, grasses, cacti", "predators": "Wolves, coyotes, cougars, bobcats, golden eagles"},
    "quokka": {"diet": "Herbivore", "diet_detail": "Feeds on grasses, leaves, bark, and seeds. Can survive long periods without water by obtaining moisture from food.", "prey": "Grasses, leaves, bark, seeds, succulents", "predators": "Dingoes, foxes, cats, birds of prey"},
    "river-otter": {"diet": "Carnivore", "diet_detail": "Primarily eats fish, but also feeds on crayfish, frogs, turtles, and aquatic invertebrates.", "prey": "Fish, crayfish, frogs, turtles, mussels", "predators": "Coyotes, bobcats, alligators, birds of prey"},
    "california-sea-lion": {"diet": "Carnivore", "diet_detail": "Feeds on squid, sardines, mackerel, rockfish, and anchovies. Can dive to 274 meters for food.", "prey": "Squid, sardines, mackerel, anchovies, rockfish", "predators": "Great white sharks, orcas"},
    "sea-otter": {"diet": "Carnivore", "diet_detail": "Feeds on sea urchins, crabs, clams, mussels, and abalone. Uses rocks as tools to crack open shells.", "prey": "Sea urchins, crabs, clams, mussels, abalone", "predators": "Orcas, great white sharks, bald eagles (pups)"},
    "serval": {"diet": "Carnivore", "diet_detail": "Uses its exceptional hearing to locate rodents in tall grass. Can leap 3 meters to catch birds in flight.", "prey": "Rodents, birds, frogs, insects, fish", "predators": "Leopards, hyenas, wild dogs"},
    "striped-skunk": {"diet": "Omnivore", "diet_detail": "Feeds on insects, small rodents, eggs, berries, and garbage. Its spray deters most predators.", "prey": "Insects, rodents, eggs, berries, grubs, garbage", "predators": "Great horned owls, coyotes, bobcats, foxes"},
    "spider-monkey": {"diet": "Omnivore", "diet_detail": "Primarily frugivorous, feeding on ripe fruits. Also eats leaves, flowers, bark, honey, and insects.", "prey": "Fruits, leaves, flowers, bark, insects, honey", "predators": "Jaguars, pumas, harpy eagles, large snakes"},
    "springbok": {"diet": "Herbivore", "diet_detail": "Both grazes on grasses and browses on shrubs and succulents. Can survive without drinking water by obtaining moisture from food.", "prey": "Grasses, shrubs, succulents, seeds, flowers", "predators": "Cheetahs, leopards, lions, hyenas, wild dogs"},
    "red-squirrel": {"diet": "Omnivore", "diet_detail": "Feeds on conifer seeds, nuts, fungi, bark, and bird eggs. Caches food for winter in multiple locations.", "prey": "Conifer seeds, nuts, fungi, berries, bird eggs", "predators": "Pine martens, goshawks, foxes, wildcats"},
    "sugar-glider": {"diet": "Omnivore", "diet_detail": "Feeds on tree sap, nectar, pollen, and insects. Can glide up to 50 meters between trees.", "prey": "Tree sap, nectar, pollen, insects, spiders", "predators": "Owls, kookaburras, cats, snakes, monitor lizards"},
    "sun-bear": {"diet": "Omnivore", "diet_detail": "Uses its long tongue to extract honey and insects from tree cavities. Also eats fruits, shoots, and small animals.", "prey": "Honey, insects, fruits, lizards, birds, termites", "predators": "Tigers, pythons, large raptors"},
    "brazilian-tapir": {"diet": "Herbivore", "diet_detail": "Uses its flexible proboscis to grasp leaves, fruits, and aquatic vegetation. An important seed disperser.", "prey": "Leaves, fruits, bark, aquatic plants, seeds", "predators": "Jaguars, pumas, caimans"},
    "walrus": {"diet": "Carnivore", "diet_detail": "Bottom-feeds on clams, mussels, snails, and other benthic invertebrates using sensitive whiskers to locate prey.", "prey": "Clams, mussels, snails, sea cucumbers, worms", "predators": "Polar bears, orcas"},
    "warthog": {"diet": "Omnivore", "diet_detail": "Grazes on grasses and uses its tough snout to dig up roots, bulbs, and tubers. Also eats bark, berries, and carrion.", "prey": "Grasses, roots, bulbs, berries, bark, insects", "predators": "Lions, leopards, cheetahs, hyenas, wild dogs, crocodiles"},
    "water-buffalo": {"diet": "Herbivore", "diet_detail": "Grazes on grasses, herbs, and aquatic vegetation, spending much of the day submerged in muddy waters.", "prey": "Grasses, herbs, aquatic plants, reeds", "predators": "Tigers, crocodiles, lions (in Africa)"},
    "white-tailed-deer": {"diet": "Herbivore", "diet_detail": "A versatile feeder eating grasses, forbs, nuts, fruits, corn, and woody browse depending on season.", "prey": "Grasses, acorns, fruits, twigs, corn, mushrooms", "predators": "Wolves, coyotes, cougars, bears, bobcats"},
    "wild-boar": {"diet": "Omnivore", "diet_detail": "Roots through soil for tubers, bulbs, and invertebrates. Also eats nuts, berries, carrion, and small animals.", "prey": "Roots, tubers, acorns, insects, eggs, small animals", "predators": "Wolves, bears, tigers, leopards, lynx"},
    "wildebeest": {"diet": "Herbivore", "diet_detail": "Grazes primarily on short grasses. Participates in the largest land migration in the world for fresh grazing.", "prey": "Short grasses, leaves", "predators": "Lions, hyenas, cheetahs, wild dogs, crocodiles"},
    "wolverine": {"diet": "Omnivore", "diet_detail": "A powerful scavenger and predator eating carrion, small to medium mammals, birds, roots, and berries.", "prey": "Carrion, rabbits, rodents, deer (weakened), berries", "predators": "Wolves, bears, cougars"},
    "yak": {"diet": "Herbivore", "diet_detail": "Grazes on grasses, lichens, and mosses at extreme high altitudes. Uses tongue and mouth to strip vegetation from snow.", "prey": "Grasses, lichens, mosses, herbs, tubers", "predators": "Wolves, snow leopards, brown bears"},
    "markhor": {"diet": "Herbivore", "diet_detail": "Browses on leaves, shrubs, and grasses on steep mountain slopes. Known for standing on hind legs to reach branches.", "prey": "Leaves, shrubs, grasses, herbs, acorns", "predators": "Snow leopards, wolves, lynx, golden eagles"},
    "spectacled-bear": {"diet": "Omnivore", "diet_detail": "Primarily herbivorous, feeding on bromeliads, fruits, palm hearts, and cacti. Occasionally eats insects and small animals.", "prey": "Bromeliads, fruits, palm hearts, cacti, corn", "predators": "Jaguars, pumas (rarely)"},
    "binturong": {"diet": "Omnivore", "diet_detail": "Feeds primarily on fruit, especially strangler figs. Also eats small mammals, birds, fish, and eggs.", "prey": "Fruits, figs, small mammals, birds, fish, eggs", "predators": "Tigers, large snakes, large raptors"},
    "saola": {"diet": "Herbivore", "diet_detail": "Browses on fig leaves, bushes, and other plants found along rivers and streams in dense forest.", "prey": "Fig leaves, shrubs, grasses, herbs", "predators": "Tigers, leopards, dholes"},
    "thomsons-gazelle": {"diet": "Herbivore", "diet_detail": "Grazes on short grasses and browses on shrubs. One of the most important prey species in the Serengeti.", "prey": "Short grasses, herbs, shrubs, seeds", "predators": "Cheetahs, lions, leopards, hyenas, wild dogs, jackals"},
    "african-grey-parrot": {"diet": "Herbivore", "diet_detail": "Feeds on seeds, nuts, fruits, and berries. Particularly fond of oil palm nuts.", "prey": "Seeds, nuts, fruits, berries, flowers", "predators": "Palm-nut vultures, monkeys, raptors"},
    "arctic-tern": {"diet": "Carnivore", "diet_detail": "Dives into water to catch small fish and crustaceans. Migrates pole to pole, seeing two summers per year.", "prey": "Small fish, crustaceans, krill, insects", "predators": "Skuas, gulls, foxes, cats, rats"},
    "barn-owl": {"diet": "Carnivore", "diet_detail": "An exceptional nocturnal hunter that locates prey by sound alone. Eats primarily voles and mice.", "prey": "Voles, mice, shrews, rats, small birds", "predators": "Great horned owls, eagles, raccoons"},
    "blue-jay": {"diet": "Omnivore", "diet_detail": "Feeds on nuts (especially acorns), seeds, berries, insects, and occasionally eggs of other birds.", "prey": "Acorns, seeds, berries, insects, caterpillars", "predators": "Hawks, owls, falcons, cats, snakes"},
    "california-condor": {"diet": "Carnivore", "diet_detail": "A scavenger feeding exclusively on carrion including deer, cattle, marine mammals, and other large animal carcasses.", "prey": "Carrion (deer, cattle, marine mammals)", "predators": "Golden eagles (young), bears, coyotes (eggs)"},
    "southern-cassowary": {"diet": "Omnivore", "diet_detail": "Primarily frugivorous, eating fallen fruits. Also eats fungi, insects, frogs, and snails. Critical seed disperser.", "prey": "Fruits, fungi, insects, frogs, snails", "predators": "Dingoes, crocodiles (chicks), feral pigs (eggs)"},
    "sulphur-crested-cockatoo": {"diet": "Herbivore", "diet_detail": "Feeds on seeds, nuts, fruits, flowers, and roots. Known to cause damage to wooden structures with powerful beak.", "prey": "Seeds, nuts, fruits, berries, roots, bulbs", "predators": "Wedge-tailed eagles, goshawks, pythons"},
    "common-raven": {"diet": "Omnivore", "diet_detail": "Extremely adaptable diet including carrion, insects, grains, berries, eggs, and food waste. Highly intelligent forager.", "prey": "Carrion, insects, grains, eggs, small animals, berries", "predators": "Great horned owls, eagles, martens"},
    "grey-crowned-crane": {"diet": "Omnivore", "diet_detail": "Feeds on grass seeds, insects, small vertebrates, and grain crops. Stamps feet while walking to flush insects.", "prey": "Grass seeds, insects, frogs, small fish, grain", "predators": "Large cats, hyenas, jackals, eagles"},
    "emu": {"diet": "Omnivore", "diet_detail": "Feeds on plant material including seeds, fruits, flowers, and young shoots. Also eats insects, caterpillars, and small lizards.", "prey": "Seeds, fruits, flowers, insects, caterpillars", "predators": "Dingoes, wedge-tailed eagles, monitor lizards (eggs)"},
    "greater-flamingo": {"diet": "Omnivore", "diet_detail": "Filter feeds on algae, diatoms, small crustaceans, and brine shrimp. Pink coloring comes from carotenoids in food.", "prey": "Brine shrimp, algae, crustaceans, mollusks", "predators": "Eagles, marabou storks, jackals, hyenas"},
    "golden-eagle": {"diet": "Carnivore", "diet_detail": "A powerful apex predator hunting rabbits, hares, marmots, ground squirrels, and occasionally young deer and lambs.", "prey": "Rabbits, hares, marmots, ground squirrels, ptarmigan", "predators": "No natural predators; occasionally other eagles"},
    "great-blue-heron": {"diet": "Carnivore", "diet_detail": "A patient wading hunter that strikes with lightning speed to catch fish, frogs, snakes, and small mammals.", "prey": "Fish, frogs, snakes, small mammals, insects", "predators": "Eagles, raccoons, crows (eggs and chicks)"},
    "great-horned-owl": {"diet": "Carnivore", "diet_detail": "The most powerful owl in the Americas, taking prey ranging from scorpions to rabbits, skunks, and even other raptors.", "prey": "Rabbits, rats, skunks, geese, raptors, scorpions", "predators": "No significant natural predators"},
    "harpy-eagle": {"diet": "Carnivore", "diet_detail": "The most powerful eagle in the world, specializing in hunting tree-dwelling mammals like sloths and monkeys.", "prey": "Sloths, monkeys, opossums, iguanas, macaws", "predators": "No natural predators"},
    "ruby-throated-hummingbird": {"diet": "Omnivore", "diet_detail": "Feeds on flower nectar using its specialized tongue. Also eats small insects and spiders for protein.", "prey": "Nectar, small insects, spiders", "predators": "Hawks, praying mantises, cats, snakes"},
    "sacred-ibis": {"diet": "Carnivore", "diet_detail": "Probes mud and shallow water for insects, worms, crustaceans, mollusks, frogs, and fish.", "prey": "Insects, worms, crustaceans, frogs, fish, eggs", "predators": "Hawks, eagles, crocodiles"},
    "common-kingfisher": {"diet": "Carnivore", "diet_detail": "Dives headfirst from a perch into water to catch small fish and aquatic invertebrates with remarkable precision.", "prey": "Small fish, aquatic insects, shrimp, tadpoles", "predators": "Sparrowhawks, cats, foxes, rats"},
    "laughing-kookaburra": {"diet": "Carnivore", "diet_detail": "Sits patiently on perches, then swoops down to catch snakes, lizards, insects, and small mammals.", "prey": "Snakes, lizards, insects, mice, small birds", "predators": "Eagles, owls, goannas, quolls"},
    "scarlet-macaw": {"diet": "Herbivore", "diet_detail": "Feeds on fruits, nuts, seeds, and flowers. Uses powerful beak to crack hard nuts. Eats clay to neutralize toxins.", "prey": "Fruits, nuts, seeds, flowers, clay", "predators": "Harpy eagles, jaguars, monkeys, snakes"},
    "great-white-pelican": {"diet": "Carnivore", "diet_detail": "Fishes cooperatively, herding fish into shallows. Can hold up to 13 liters in its bill pouch.", "prey": "Fish, crustaceans, small birds, eggs", "predators": "Crocodiles, jackals, hyenas"},
    "king-penguin": {"diet": "Carnivore", "diet_detail": "Dives to depths over 300 meters to catch lanternfish and squid. Can hold breath for over 7 minutes.", "prey": "Lanternfish, squid, krill", "predators": "Leopard seals, orcas, skuas (chicks)"},
    "peregrine-falcon": {"diet": "Carnivore", "diet_detail": "The fastest animal on Earth, reaching speeds over 380 km/h in a stoop. Hunts pigeons, ducks, and songbirds.", "prey": "Pigeons, ducks, shorebirds, songbirds, bats", "predators": "Great horned owls, eagles"},
    "atlantic-puffin": {"diet": "Carnivore", "diet_detail": "Dives underwater to catch small fish like sand eels and herring, carrying multiple fish crosswise in its bill.", "prey": "Sand eels, herring, capelin, sprats", "predators": "Great skuas, herring gulls, arctic foxes, rats"},
    "red-tailed-hawk": {"diet": "Carnivore", "diet_detail": "Soars high to spot prey, then dives to catch rodents, rabbits, and snakes. The most common hawk in North America.", "prey": "Rodents, rabbits, snakes, birds, squirrels", "predators": "Great horned owls, other large raptors"},
    "secretary-bird": {"diet": "Carnivore", "diet_detail": "Famous for stomping snakes to death with powerful legs. Also eats lizards, small mammals, and insects.", "prey": "Snakes, lizards, small mammals, insects, birds", "predators": "Eagles, large owls"},
    "shoebill": {"diet": "Carnivore", "diet_detail": "Stands motionless for hours before lunging to catch lungfish, catfish, tilapia, and occasionally baby crocodiles.", "prey": "Lungfish, catfish, tilapia, frogs, baby crocodiles", "predators": "No significant natural predators"},
    "snowy-owl": {"diet": "Carnivore", "diet_detail": "Hunts lemmings as primary prey, eating 3-5 per day. Also takes ptarmigan, rabbits, rodents, and waterfowl.", "prey": "Lemmings, ptarmigan, rabbits, voles, waterfowl", "predators": "Arctic foxes, wolves, other large raptors"},
    "white-stork": {"diet": "Carnivore", "diet_detail": "Walks slowly through fields and wetlands catching insects, frogs, snakes, fish, and small mammals.", "prey": "Insects, frogs, snakes, fish, rodents, earthworms", "predators": "Eagles, large hawks"},
    "mute-swan": {"diet": "Herbivore", "diet_detail": "Feeds mainly on aquatic plants, grasses, and grain. Uses long neck to reach submerged vegetation.", "prey": "Aquatic plants, grasses, algae, grain, small fish", "predators": "Foxes, coyotes, raccoons (eggs), eagles"},
    "whooping-crane": {"diet": "Omnivore", "diet_detail": "Probes marshes for crabs, clams, frogs, and aquatic plants. One of the rarest birds in North America.", "prey": "Crabs, clams, frogs, fish, insects, berries, grain", "predators": "Bobcats, wolverines, eagles, ravens (eggs)"},
    "northern-cardinal": {"diet": "Omnivore", "diet_detail": "Feeds on seeds, berries, and insects. Particularly fond of sunflower seeds. Males feed females during courtship.", "prey": "Seeds, berries, insects, beetles, grasshoppers", "predators": "Hawks, shrikes, cats, snakes, squirrels (eggs)"},
    "roadrunner": {"diet": "Omnivore", "diet_detail": "Runs down prey on the ground including lizards, snakes, insects, scorpions, and small birds. Can kill rattlesnakes.", "prey": "Lizards, snakes, insects, scorpions, small birds", "predators": "Hawks, coyotes, raccoons, cats"},
    "american-alligator": {"diet": "Carnivore", "diet_detail": "An apex predator eating fish, turtles, birds, deer, and other reptiles. Uses a powerful bite force of over 2,000 psi.", "prey": "Fish, turtles, birds, deer, snakes, mammals", "predators": "No natural predators as adults"},
    "bearded-dragon": {"diet": "Omnivore", "diet_detail": "Eats insects, small vertebrates, flowers, and fruits. Diet shifts from mostly insects when young to more plants as adults.", "prey": "Insects, crickets, flowers, fruits, small lizards", "predators": "Birds of prey, dingoes, snakes, goannas"},
    "black-mamba": {"diet": "Carnivore", "diet_detail": "Hunts small mammals, birds, and lizards with extremely potent neurotoxic venom. The fastest snake in Africa.", "prey": "Rodents, birds, bats, lizards, hyraxes", "predators": "Mongoose, honey badgers, snake eagles, secretary birds"},
    "galapagos-tortoise": {"diet": "Herbivore", "diet_detail": "Feeds on grasses, cacti, fruits, and leaves. Can survive up to a year without food or water.", "prey": "Grasses, cacti, fruits, leaves, lichens", "predators": "Introduced species (rats, pigs, dogs eat eggs/hatchlings)"},
    "gharial": {"diet": "Carnivore", "diet_detail": "Specialized fish eater with long narrow snout filled with interlocking teeth. Catches fish with quick lateral snaps.", "prey": "Fish, frogs, crustaceans", "predators": "No natural predators as adults"},
    "green-sea-turtle": {"diet": "Herbivore", "diet_detail": "The only herbivorous sea turtle as an adult, grazing on seagrasses and algae. Juveniles are omnivorous.", "prey": "Seagrasses, algae, jellyfish (juveniles)", "predators": "Tiger sharks, orcas, jaguars (on beaches), raccoons (eggs)"},
    "hawksbill-sea-turtle": {"diet": "Omnivore", "diet_detail": "Feeds primarily on sea sponges, but also eats algae, jellyfish, sea urchins, and mollusks.", "prey": "Sponges, algae, jellyfish, sea urchins, mollusks", "predators": "Sharks, crocodiles, octopuses, raccoons (eggs)"},
    "leatherback-sea-turtle": {"diet": "Carnivore", "diet_detail": "Feeds almost exclusively on jellyfish, consuming up to 73% of its body weight daily.", "prey": "Jellyfish, sea squirts, squid", "predators": "Orcas, sharks, jaguars (on beaches)"},
    "marine-iguana": {"diet": "Herbivore", "diet_detail": "The only lizard that forages in the sea, diving up to 20 meters to graze on algae. Sneezes salt from specialized glands.", "prey": "Marine algae, seaweed", "predators": "Hawks, herons, snakes, rats, cats, dogs"},
    "saltwater-crocodile": {"diet": "Carnivore", "diet_detail": "An ambush apex predator with the strongest bite force of any living animal. Eats fish, mammals, and birds.", "prey": "Fish, turtles, birds, buffalo, sharks, monkeys", "predators": "No natural predators as adults"},
    "tuatara": {"diet": "Carnivore", "diet_detail": "Feeds on insects, spiders, frogs, small lizards, and bird eggs. A living fossil surviving since the dinosaur age.", "prey": "Insects, spiders, frogs, small lizards, bird eggs", "predators": "Introduced rats, cats, birds of prey"},
    "gila-monster": {"diet": "Carnivore", "diet_detail": "Feeds on bird and reptile eggs, small mammals, and nestling birds. Stores fat in its tail for lean times.", "prey": "Eggs, small mammals, lizards, frogs, insects", "predators": "Raptors, coyotes"},
    "gaboon-viper": {"diet": "Carnivore", "diet_detail": "An ambush predator with the longest fangs of any venomous snake (up to 5 cm). Strikes passing rodents and birds.", "prey": "Rodents, birds, frogs, rabbits", "predators": "Mongoose, monitor lizards, snake eagles"},
    "panther-chameleon": {"diet": "Insectivore", "diet_detail": "Catches insects with a ballistic tongue that can extend twice its body length in a fraction of a second.", "prey": "Crickets, locusts, flies, mantises, caterpillars", "predators": "Snakes, birds, mongoose"},
    "burmese-python": {"diet": "Carnivore", "diet_detail": "A powerful constrictor eating mammals, birds, and reptiles. Can consume prey as large as a deer.", "prey": "Rats, rabbits, birds, deer, alligators (in Florida)", "predators": "Alligators, large cats, king cobras"},
    "western-diamondback-rattlesnake": {"diet": "Carnivore", "diet_detail": "Uses heat-sensing pits to detect warm-blooded prey. Strikes with hemotoxic venom then tracks the dying prey.", "prey": "Rodents, rabbits, birds, lizards", "predators": "Hawks, eagles, kingsnakes, roadrunners"},
    "green-iguana": {"diet": "Herbivore", "diet_detail": "Feeds on leaves, flowers, and fruits from a wide variety of plants. Juveniles may occasionally eat insects.", "prey": "Leaves, flowers, fruits, plant shoots", "predators": "Hawks, eagles, snakes, raccoons, cats"},
    "thorny-devil": {"diet": "Insectivore", "diet_detail": "Feeds exclusively on ants, eating up to 3,000 in a single meal. Collects moisture through its skin channels.", "prey": "Ants (Iridomyrmex species primarily)", "predators": "Bustards, goannas, humans"},
    "axolotl": {"diet": "Carnivore", "diet_detail": "Feeds on mollusks, worms, insect larvae, crustaceans, and small fish using suction to gulp prey.", "prey": "Worms, insects, mollusks, small fish, crustaceans", "predators": "Introduced tilapia and carp, birds"},
    "american-bullfrog": {"diet": "Carnivore", "diet_detail": "An aggressive predator eating anything it can swallow including insects, mice, fish, birds, and other frogs.", "prey": "Insects, mice, fish, snakes, birds, frogs, crayfish", "predators": "Herons, raccoons, snapping turtles, bass, snakes"},
    "cane-toad": {"diet": "Omnivore", "diet_detail": "Eats nearly anything including insects, small reptiles, birds, and pet food. Toxic skin deters most predators.", "prey": "Insects, small mammals, reptiles, other frogs", "predators": "Meat ants, keelback snakes, crows (flip to eat)"},
    "fire-salamander": {"diet": "Carnivore", "diet_detail": "Hunts at night for insects, spiders, earthworms, and slugs. Toxic skin secretions deter predators.", "prey": "Insects, spiders, earthworms, slugs", "predators": "Snakes, birds, hedgehogs"},
    "chinese-giant-salamander": {"diet": "Carnivore", "diet_detail": "The world's largest amphibian, feeding on fish, frogs, crabs, shrimp, worms, and insects.", "prey": "Fish, frogs, crabs, shrimp, worms, insects", "predators": "No natural predators (humans are main threat)"},
    "golden-poison-frog": {"diet": "Carnivore", "diet_detail": "Feeds on ants, beetles, and termites. The most toxic animal on Earth; one frog's poison can kill 10 adults.", "prey": "Ants, beetles, termites, flies, mites", "predators": "One snake species (Leimadophis epinephelus) is resistant"},
    "red-eyed-tree-frog": {"diet": "Carnivore", "diet_detail": "Hunts at night for insects, using its bright red eyes in a startle display to confuse predators.", "prey": "Crickets, flies, moths, grasshoppers, small frogs", "predators": "Snakes, birds, bats, spiders, dragonflies"},
    "hellbender": {"diet": "Carnivore", "diet_detail": "Feeds primarily on crayfish, but also eats fish, frogs, worms, and insects in clear, fast-flowing streams.", "prey": "Crayfish, fish, tadpoles, worms, insects", "predators": "Large fish, turtles, snakes, raccoons"},
    "glass-frog": {"diet": "Carnivore", "diet_detail": "Feeds on small insects and spiders. Named for transparent belly skin that reveals internal organs.", "prey": "Flies, spiders, small insects, crickets", "predators": "Snakes, wasps, birds"},
    "tiger-salamander": {"diet": "Carnivore", "diet_detail": "Eats insects, worms, slugs, and other small invertebrates. Larvae are aquatic predators eating anything small enough.", "prey": "Insects, worms, slugs, snails, small frogs", "predators": "Badgers, snakes, owls, raccoons"},
    "darwins-frog": {"diet": "Carnivore", "diet_detail": "Feeds on small invertebrates. Males incubate eggs in their vocal sacs until fully developed froglets emerge.", "prey": "Insects, worms, snails, spiders", "predators": "Rodents, snakes, birds"},
    "japanese-giant-salamander": {"diet": "Carnivore", "diet_detail": "A nocturnal ambush predator that waits for fish, frogs, crabs, and insects to pass close to its hiding spot.", "prey": "Fish, frogs, crabs, insects, worms", "predators": "No natural predators (humans are main threat)"},
    "anglerfish": {"diet": "Carnivore", "diet_detail": "Uses a bioluminescent lure to attract prey in the deep sea. Can swallow prey up to twice its size.", "prey": "Fish, squid, crustaceans, snails", "predators": "Large deep-sea fish, sperm whales"},
    "great-barracuda": {"diet": "Carnivore", "diet_detail": "An ambush predator using bursts of speed up to 58 km/h to catch fish with its razor-sharp teeth.", "prey": "Fish (groupers, snapper, mullet), squid", "predators": "Sharks, dolphins, goliath grouper"},
    "clownfish": {"diet": "Omnivore", "diet_detail": "Feeds on algae, plankton, and small invertebrates while living symbiotically within sea anemones.", "prey": "Algae, plankton, small invertebrates, anemone scraps", "predators": "Large fish, eels (protected by anemone host)"},
    "coelacanth": {"diet": "Carnivore", "diet_detail": "A living fossil feeding on fish, squid, and cuttlefish in deep underwater caves.", "prey": "Fish, squid, cuttlefish, octopus", "predators": "Large sharks"},
    "electric-eel": {"diet": "Carnivore", "diet_detail": "Stuns prey with electric shocks up to 860 volts. Feeds on fish, amphibians, birds, and small mammals.", "prey": "Fish, frogs, crabs, shrimp, small mammals", "predators": "Caimans, large cats (rare)"},
    "great-hammerhead-shark": {"diet": "Carnivore", "diet_detail": "Uses its wide head to pin stingrays against the ocean floor. Also eats fish, squid, and other sharks.", "prey": "Stingrays, fish, squid, octopus, other sharks", "predators": "Orcas, larger sharks"},
    "red-lionfish": {"diet": "Carnivore", "diet_detail": "An invasive predator eating over 50 species of reef fish. Uses fan-like pectoral fins to herd prey.", "prey": "Small fish, shrimp, crabs, mollusks", "predators": "Groupers, sharks, moray eels, cornetfish"},
    "giant-oceanic-manta-ray": {"diet": "Carnivore", "diet_detail": "Filter feeds on plankton and small fish, directing food into its mouth with specialized cephalic fins.", "prey": "Plankton, small fish, krill", "predators": "Large sharks, orcas"},
    "piranha": {"diet": "Omnivore", "diet_detail": "Despite reputation, piranhas mainly scavenge. Feeds on fish, insects, plants, and carrion. Dangerous in groups when hungry.", "prey": "Fish, insects, plants, crustaceans, carrion", "predators": "Caimans, river dolphins, large fish, birds"},
    "pufferfish": {"diet": "Omnivore", "diet_detail": "Eats algae, invertebrates, and shellfish. Contains tetrodotoxin, one of the most potent toxins in nature.", "prey": "Algae, invertebrates, shellfish, mussels, clams", "predators": "Tiger sharks, sea snakes (resistant to toxin)"},
    "atlantic-salmon": {"diet": "Carnivore", "diet_detail": "Juveniles eat insects and invertebrates in rivers. Adults feed on fish, squid, and shrimp in the ocean.", "prey": "Fish, squid, shrimp, insects (juveniles)", "predators": "Bears, eagles, seals, sharks, orcas, pike"},
    "common-seahorse": {"diet": "Carnivore", "diet_detail": "Sucks up tiny crustaceans and plankton through its tubular snout. Eats almost constantly due to no stomach.", "prey": "Copepods, brine shrimp, plankton, tiny fish larvae", "predators": "Crabs, tuna, rays, penguins, sea turtles"},
    "atlantic-sturgeon": {"diet": "Carnivore", "diet_detail": "A bottom feeder using barbels to detect worms, crustaceans, and mollusks in sediment.", "prey": "Worms, crustaceans, mollusks, small fish, insects", "predators": "Sharks, sea lampreys, large fish"},
    "swordfish": {"diet": "Carnivore", "diet_detail": "Uses its bill to slash through schools of fish, stunning prey before eating. Can swim at 100 km/h.", "prey": "Mackerel, herring, squid, crustaceans, hake", "predators": "Orcas, mako sharks, large marlins"},
    "atlantic-bluefin-tuna": {"diet": "Carnivore", "diet_detail": "A powerful predator reaching speeds of 70 km/h. Feeds on fish, squid, and crustaceans.", "prey": "Herring, mackerel, squid, crustaceans, eels", "predators": "Orcas, mako sharks, great white sharks"},
    "whale-shark": {"diet": "Carnivore", "diet_detail": "The world's largest fish, filter feeding on plankton, fish eggs, krill, and small fish.", "prey": "Plankton, krill, fish eggs, small fish, squid", "predators": "Orcas, blue sharks, white sharks"},
    "leafy-sea-dragon": {"diet": "Carnivore", "diet_detail": "Sucks up tiny crustaceans and plankton through its pipe-like snout. Perfectly camouflaged as floating seaweed.", "prey": "Mysid shrimp, plankton, larval fish", "predators": "Large fish, anemones (when small)"},
    "basking-shark": {"diet": "Carnivore", "diet_detail": "The second-largest fish, filter feeding on plankton by swimming with its enormous mouth open.", "prey": "Plankton, copepods, fish eggs, small fish", "predators": "Orcas, great white sharks"},
    "arapaima": {"diet": "Carnivore", "diet_detail": "One of the largest freshwater fish, feeding on fish, crustaceans, and even birds and small mammals at the surface.", "prey": "Fish, crustaceans, insects, birds, small mammals", "predators": "Jaguars, caimans, large birds (juveniles)"},
    "ocean-sunfish": {"diet": "Carnivore", "diet_detail": "Feeds primarily on jellyfish but also eats squid, crustaceans, and small fish. The heaviest bony fish.", "prey": "Jellyfish, squid, crustaceans, fish larvae", "predators": "Orcas, sea lions, great white sharks"},
    "mahi-mahi": {"diet": "Carnivore", "diet_detail": "A fast-growing predator eating flying fish, squid, crabs, and mackerel near the ocean surface.", "prey": "Flying fish, squid, crabs, mackerel, shrimp", "predators": "Sharks, marlins, swordfish, large tuna"},
    "flying-fish": {"diet": "Omnivore", "diet_detail": "Feeds on plankton and small crustaceans near the surface. Glides above water to escape predators.", "prey": "Plankton, small crustaceans, algae", "predators": "Tuna, marlins, swordfish, dolphins, birds"},
    "stonefish": {"diet": "Carnivore", "diet_detail": "The most venomous fish in the world, lying perfectly camouflaged on the seabed to ambush passing prey.", "prey": "Small fish, shrimp, crustaceans", "predators": "Sharks, rays, sea snakes"},
    "blue-ringed-octopus": {"diet": "Carnivore", "diet_detail": "Hunts crabs, shrimp, and small fish. Carries enough venom to kill 26 adults; no antivenom exists.", "prey": "Crabs, shrimp, small fish, hermit crabs", "predators": "Moray eels, sharks, snappers"},
    "emperor-scorpion": {"diet": "Carnivore", "diet_detail": "Hunts insects, spiders, and small vertebrates using its large pincers. Venom is mild compared to other scorpions.", "prey": "Insects, spiders, small vertebrates, termites", "predators": "Birds, bats, shrews, centipedes, large spiders"},
    "giant-pacific-octopus": {"diet": "Carnivore", "diet_detail": "The largest octopus species, using intelligence and camouflage to hunt shrimp, crabs, clams, and fish.", "prey": "Shrimp, crabs, clams, fish, other octopuses", "predators": "Sperm whales, harbor seals, sea otters, sharks"},
    "goliath-beetle": {"diet": "Omnivore", "diet_detail": "Adults feed on tree sap and fruit. Larvae eat high-protein foods including decaying wood and other organic matter.", "prey": "Tree sap, fruit, decaying wood (larvae)", "predators": "Birds, lizards, small mammals, bats"},
    "western-honeybee": {"diet": "Herbivore", "diet_detail": "Collects nectar and pollen from flowers. Converts nectar to honey for colony food stores. Essential pollinator.", "prey": "Nectar, pollen, honey", "predators": "Bears, honey badgers, birds, wasps, spiders"},
    "atlantic-horseshoe-crab": {"diet": "Omnivore", "diet_detail": "Feeds on worms, clams, algae, and decaying organic matter on the ocean floor. A living fossil over 450 million years old.", "prey": "Worms, clams, algae, mollusks, small fish", "predators": "Shorebirds, sea turtles, sharks, alligators"},
    "japanese-spider-crab": {"diet": "Omnivore", "diet_detail": "Scavenges on dead animals and plant matter on the deep sea floor. Has the largest leg span of any arthropod.", "prey": "Dead animals, algae, mollusks, plant matter", "predators": "Octopuses, large fish, stingrays"},
    "moon-jellyfish": {"diet": "Carnivore", "diet_detail": "Captures plankton, fish eggs, and small crustaceans using stinging tentacles. Mostly drifts with ocean currents.", "prey": "Plankton, fish eggs, small crustaceans, larvae", "predators": "Sea turtles, ocean sunfish, tuna"},
    "american-lobster": {"diet": "Omnivore", "diet_detail": "A bottom-dwelling scavenger and predator eating fish, mollusks, worms, algae, and other crustaceans.", "prey": "Fish, mollusks, worms, algae, crabs, sea urchins", "predators": "Cod, flounder, crabs, seals, raccoons, humans"},
    "monarch-butterfly": {"diet": "Herbivore", "diet_detail": "Adults drink flower nectar. Larvae feed exclusively on milkweed, which makes them toxic to predators.", "prey": "Nectar (adults), milkweed leaves (larvae)", "predators": "Birds (orioles, grosbeaks), mice, wasps, parasitoids"},
    "chambered-nautilus": {"diet": "Carnivore", "diet_detail": "Scavenges on dead crustaceans and fish, using its tentacles to capture food. A living fossil unchanged for 500 million years.", "prey": "Dead fish, crustaceans, detritus", "predators": "Octopuses, sharks, triggerfish, sea turtles"},
    "portuguese-man-o-war": {"diet": "Carnivore", "diet_detail": "Not a true jellyfish but a colonial organism. Uses venomous tentacles up to 30 meters long to paralyze fish.", "prey": "Small fish, shrimp, plankton, fish larvae", "predators": "Sea turtles, blanket octopus, sea slugs"},
    "goliath-birdeater": {"diet": "Carnivore", "diet_detail": "The world's largest spider by mass. Eats insects, frogs, lizards, mice, and occasionally small birds.", "prey": "Insects, frogs, lizards, mice, small birds", "predators": "Tarantula hawk wasps, large snakes, coatis"},
    "giant-squid": {"diet": "Carnivore", "diet_detail": "Hunts deep-sea fish and other squid in the ocean depths. Uses the longest tentacles of any living creature.", "prey": "Deep-sea fish, other squid, crustaceans", "predators": "Sperm whales (primary predator)"},
    "leafcutter-ant": {"diet": "Herbivore", "diet_detail": "Cuts and carries leaf fragments to underground fungus gardens. Feeds on the cultivated fungus, not the leaves.", "prey": "Cultivated fungus, plant sap", "predators": "Anteaters, armadillos, army ants, birds, parasitic flies"},
    "mantis-shrimp": {"diet": "Carnivore", "diet_detail": "Strikes with the force of a .22 caliber bullet, smashing hard-shelled prey. Has the most complex eyes in nature.", "prey": "Crabs, snails, clams, fish, oysters", "predators": "Larger fish, barracuda, sharks"},
    "emperor-dragonfly": {"diet": "Carnivore", "diet_detail": "A powerful aerial predator catching mosquitoes, flies, butterflies, and even other dragonflies in flight.", "prey": "Mosquitoes, flies, butterflies, moths, beetles", "predators": "Birds, frogs, spiders, fish (larvae)"},
    "crown-of-thorns-starfish": {"diet": "Carnivore", "diet_detail": "Feeds on coral polyps by extruding its stomach onto the reef. Outbreaks can devastate coral reefs.", "prey": "Coral polyps (especially fast-growing species)", "predators": "Giant triton snail, titan triggerfish, pufferfish"},
    "giant-african-land-snail": {"diet": "Herbivore", "diet_detail": "Feeds on over 500 species of plants plus calcium sources like concrete and bone for shell growth.", "prey": "Leaves, fruits, flowers, bark, soil, calcium", "predators": "Rats, birds, fire ants, land crabs, beetles"},
    "atlas-moth": {"diet": "Herbivore", "diet_detail": "Adults do not eat at all (no functioning mouthparts). Larvae feed on citrus, cinnamon, and guava leaves.", "prey": "Citrus leaves, cinnamon leaves, guava leaves (larvae)", "predators": "Birds, lizards, parasitic wasps"},
    "coconut-crab": {"diet": "Omnivore", "diet_detail": "The world's largest terrestrial arthropod, cracking coconuts with powerful claws. Also eats fruits, nuts, and carrion.", "prey": "Coconuts, fruits, nuts, seeds, carrion, other crabs", "predators": "No natural predators as adults; rats (juveniles)"},
    "box-jellyfish": {"diet": "Carnivore", "diet_detail": "Uses 60 tentacles with millions of nematocysts to capture shrimp and small fish. Has 24 eyes.", "prey": "Shrimp, small fish, worms, crustaceans", "predators": "Sea turtles, some fish species"},
    "garden-spider": {"diet": "Carnivore", "diet_detail": "Builds large orb webs to capture flying insects. Eats the web each night and rebuilds a new one.", "prey": "Flies, mosquitoes, moths, beetles, wasps", "predators": "Birds, wasps, lizards, shrews"},
}


def fetch_wikipedia_image(name: str, wiki_title: str | None = None) -> dict:
    """Fetch image from Wikipedia REST API with retry."""
    title = (wiki_title or name).replace(" ", "_")
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title, safe='')}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "WildAtlas/1.0 (animal-database)"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read())
            result = {}
            if "originalimage" in data:
                result["hero_image_url"] = data["originalimage"]["source"]
            if "thumbnail" in data:
                result["thumbnail_url"] = data["thumbnail"]["source"]
            if "extract" in data and len(data["extract"]) > 50:
                result["wiki_summary"] = data["extract"]
            return result
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                time.sleep(2 * (attempt + 1))
                continue
            print(f"  Wikipedia failed for '{title}': {e}")
            return {}
    return {}


async def fix_data():
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as db:
        # Get all animals
        result = await db.execute(select(Animal).order_by(Animal.common_name))
        animals = result.scalars().all()

        no_img = [a for a in animals if not a.hero_image_url]
        no_diet = [a for a in animals if not a.diet or not a.predators]

        print(f"Total animals: {len(animals)}")
        print(f"Animals missing images: {len(no_img)}")
        print(f"Animals missing diet/predators: {len(no_diet)}")

        # Fix images
        print("\n=== Fixing missing images ===")
        for i, animal in enumerate(no_img, 1):
            print(f"  [{i}/{len(no_img)}] Fetching image for {animal.common_name}...")
            wiki_data = fetch_wikipedia_image(animal.common_name)
            if wiki_data.get("hero_image_url"):
                animal.hero_image_url = wiki_data["hero_image_url"]
                animal.thumbnail_url = wiki_data.get("thumbnail_url")
                if wiki_data.get("wiki_summary") and not animal.wiki_summary:
                    animal.wiki_summary = wiki_data["wiki_summary"]
                # Also add Image record
                from sqlalchemy import exists
                has_hero = await db.execute(
                    select(exists().where(
                        (Image.animal_id == animal.id) & (Image.is_hero == True)
                    ))
                )
                if not has_hero.scalar():
                    db.add(Image(animal_id=animal.id, url=wiki_data["hero_image_url"], is_hero=True, source="wikipedia"))
                print(f"    -> Got image!")
            else:
                print(f"    -> No image found")
            time.sleep(0.5)  # Rate limit

        # Fix diet and predation
        print("\n=== Fixing diet/predation data ===")
        fixed = 0
        for animal in animals:
            slug = animal.slug
            if slug in DIET_PREDATION_DATA:
                data = DIET_PREDATION_DATA[slug]
                changed = False
                if not animal.diet and data.get("diet"):
                    animal.diet = data["diet"]
                    changed = True
                if not animal.diet_detail and data.get("diet_detail"):
                    animal.diet_detail = data["diet_detail"]
                    changed = True
                if not animal.prey and data.get("prey"):
                    animal.prey = data["prey"]
                    changed = True
                if not animal.predators and data.get("predators"):
                    animal.predators = data["predators"]
                    changed = True
                if changed:
                    fixed += 1

        print(f"Updated diet/predation for {fixed} animals")

        await db.commit()

    await engine.dispose()
    print("\nFix complete!")


if __name__ == "__main__":
    asyncio.run(fix_data())
