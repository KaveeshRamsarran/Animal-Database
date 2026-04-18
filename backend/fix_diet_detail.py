"""Fix missing diet_detail for the 53 original animals."""
import asyncio
from app.db.base_all import Base
from app.models.animal import Animal
from app.models.image import Image
from app.models.continent import Continent
from app.models.conservation import ConservationStatus
from app.models.behavior import Behavior
from app.models.country import Country
from app.models.occurrence import Occurrence
from app.models.fact import Fact
from app.models.user import User
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.core.config import get_settings

DIET_DETAILS = {
    "african-lion": "African lions are apex carnivores that primarily hunt large ungulates such as zebras, wildebeest, buffalo, and antelope. They hunt cooperatively in prides, which allows them to take down prey much larger than themselves. Lions also scavenge from other predators and occasionally eat smaller animals like hares and birds.",
    "african-wild-dog": "African wild dogs are hypercarnivores that hunt in highly coordinated packs. Their primary prey includes medium-sized antelope such as impala, springbok, and kudu. They have an exceptionally high hunting success rate of around 80%, chasing prey over long distances at speeds up to 44 mph.",
    "american-bison": "American bison are herbivores that graze primarily on grasses and sedges across the Great Plains. They spend much of the day feeding, consuming around 30 pounds of vegetation daily. In winter, they use their massive heads to sweep away snow to reach dried grasses beneath.",
    "arctic-fox": "Arctic foxes are opportunistic omnivores whose diet varies seasonally. In summer, they hunt lemmings, voles, and birds, and also eat eggs, berries, and insects. In winter, they scavenge from polar bear kills and cache food for lean times. Lemmings are their most important prey, and fox populations often cycle with lemming abundance.",
    "asian-elephant": "Asian elephants are herbivores that feed on grasses, bark, roots, leaves, and small stems. They consume up to 300 pounds of food per day, spending 16-18 hours foraging. They are important seed dispersers and ecosystem engineers, creating clearings and pathways through dense forest.",
    "bald-eagle": "Bald eagles are opportunistic carnivores that feed primarily on fish, which they snatch from the water with their powerful talons. They also eat waterfowl, small mammals, and carrion. Near salmon spawning grounds, they may gather in large numbers to feast on spawning and dead fish.",
    "bottlenose-dolphin": "Bottlenose dolphins are carnivores that feed on a variety of fish, squid, and crustaceans. They use echolocation to find prey and employ cooperative hunting strategies such as herding fish into tight balls or driving them onto mud banks. An adult dolphin eats 15-30 pounds of food per day.",
    "capybara": "Capybaras are herbivores that graze mainly on grasses and aquatic plants. They are highly selective grazers, preferring short grasses near water. They also eat bark, fruit, and their own feces (coprophagy) to extract maximum nutrients and beneficial gut bacteria from their food.",
    "cheetah": "Cheetahs are carnivores that rely on speed to catch prey, primarily targeting small to medium antelope like Thomson's gazelle, impala, and springbok. They stalk prey to within 60-70 meters before sprinting at up to 70 mph. Unlike other big cats, they hunt mainly during the day to avoid competition.",
    "emperor-penguin": "Emperor penguins are carnivores that feed on fish, squid, and krill in the frigid Southern Ocean. They can dive to depths exceeding 1,800 feet and hold their breath for over 20 minutes while hunting. Antarctic silverfish make up the bulk of their diet, supplemented by glacial squid and Antarctic krill.",
    "eurasian-lynx": "Eurasian lynx are carnivores that primarily hunt small ungulates such as roe deer, chamois, and musk deer. They also take hares, foxes, and birds. They are stalk-and-ambush hunters, using dense vegetation for cover before pouncing on prey with a powerful leap.",
    "european-brown-bear": "European brown bears are omnivores with a diet that varies greatly by season. In spring they eat grasses, roots, and carrion; in summer they add berries, insects, and honey; in autumn they gorge on nuts, fruits, and salmon where available. Up to 80% of their diet is plant-based.",
    "european-hedgehog": "European hedgehogs are omnivores that feed primarily on invertebrates including beetles, caterpillars, earthworms, and slugs. They also eat frogs, bird eggs, mushrooms, and fallen fruit. They forage at night using their keen sense of smell, covering up to 2 km in a single evening.",
    "giant-panda": "Giant pandas are herbivores that feed almost exclusively on bamboo, consuming 26-84 pounds daily. They eat leaves, stems, and shoots of over 60 bamboo species. Despite having a carnivore's digestive system, they have adapted to process bamboo, though they digest only about 17% of what they consume.",
    "giraffe": "Giraffes are herbivores that browse on leaves, flowers, and fruits from tall trees, with acacia species being their favorite. Their 18-inch prehensile tongues and flexible lips allow them to strip leaves from thorny branches. They eat up to 75 pounds of foliage per day and can go weeks without drinking water.",
    "gorilla": "Gorillas are primarily herbivores that eat leaves, stems, fruit, bark, and bamboo shoots. Mountain gorillas consume mostly foliage, while lowland gorillas eat more fruit. They occasionally eat insects like ants and termites. An adult male can consume up to 40 pounds of vegetation daily.",
    "gray-wolf": "Gray wolves are carnivores that hunt in packs, preying primarily on large ungulates such as elk, deer, moose, and caribou. They are endurance hunters, pursuing prey for miles until it tires. A wolf can eat up to 20 pounds of meat in a single feeding, then go days without eating.",
    "great-white-shark": "Great white sharks are apex carnivores that feed on marine mammals including seals, sea lions, and small whales, as well as large fish and sea turtles. Young sharks primarily eat fish. They employ an ambush strategy, attacking from below with tremendous speed and force.",
    "green-anaconda": "Green anacondas are carnivores that use constriction to kill prey. They feed on fish, birds, capybaras, caimans, deer, and wild pigs. As ambush predators, they lie in wait near water, striking quickly and coiling around their prey. They can consume animals as large as jaguars and can go weeks between meals.",
    "grizzly-bear": "Grizzly bears are omnivores with a highly varied diet. They eat berries, roots, grasses, fungi, fish (especially salmon during spawning runs), insects, elk calves, and carrion. Before hibernation, they enter hyperphagia, eating up to 90 pounds of food daily to build fat reserves.",
    "hippopotamus": "Hippos are herbivores that graze on short grasses during nighttime foraging sessions, consuming about 80 pounds of grass nightly. They leave the water at dusk and follow well-worn paths to grazing areas up to 6 miles away. Despite spending most of their day in water, they do not eat aquatic plants.",
    "humpback-whale": "Humpback whales are carnivores that feed on krill, small schooling fish like herring, mackerel, and sand lance. They use a remarkable technique called bubble-net feeding, where they blow bubbles in a spiral to concentrate prey before lunging through the concentrated mass with mouths wide open.",
    "indian-peafowl": "Indian peafowl are omnivores that forage on the ground for seeds, grains, berries, insects, small reptiles, and amphibians. They scratch through leaf litter and soil to find food. They are especially fond of cultivated crops and are also known to eat flower petals, young cobras, and small snakes.",
    "jaguar": "Jaguars are apex carnivores with the most powerful bite of any big cat. They prey on over 85 species including deer, peccaries, capybaras, caimans, tapirs, and turtles. Their powerful jaws can pierce turtle shells and caiman skulls. They are one of the few cats that regularly kill by biting through the skull.",
    "king-cobra": "King cobras are ophiophagous carnivores, meaning they primarily eat other snakes, including rat snakes, pythons, and even other venomous species. They also occasionally consume lizards. They use their potent neurotoxic venom to subdue prey before swallowing it whole, and can go months between large meals.",
    "kiwi": "Kiwis are omnivores that forage at night, probing soil and leaf litter with their long bills. They feed primarily on earthworms, insects, larvae, and other invertebrates. They also eat fallen berries and seeds. Uniquely among birds, kiwis have nostrils at the tip of their bill, giving them an excellent sense of smell for locating buried prey.",
    "koala": "Koalas are herbivores that feed almost exclusively on eucalyptus leaves, consuming about 1-2 pounds daily. They are highly selective, preferring certain eucalyptus species and even specific trees. Eucalyptus leaves are toxic to most animals, but koalas have a specialized digestive system with an elongated caecum to detoxify the compounds.",
    "komodo-dragon": "Komodo dragons are carnivores and apex predators that eat virtually any meat, including deer, pigs, water buffalo, and smaller dragons. They use a combination of sharp serrated teeth, powerful claws, and toxic bacteria-laden saliva (plus venom glands) to kill prey. They can consume up to 80% of their body weight in a single feeding.",
    "leopard-seal": "Leopard seals are apex carnivores of the Antarctic that feed on a variety of prey including krill, fish, squid, penguins, and even other seal species. They are powerful ambush predators, often waiting beneath ice edges to catch penguins entering the water. They thrash large prey on the surface to tear it into manageable pieces.",
    "llama": "Llamas are herbivores that graze on grasses and browse on shrubs, lichens, and mountain vegetation. They are efficient eaters that consume less food relative to their body size compared to other livestock. They have a three-compartment stomach that allows them to digest tough, low-quality forage effectively.",
    "mandrill": "Mandrills are omnivores that forage on the forest floor and in trees. Their diet includes fruits, seeds, leaves, bark, insects, spiders, scorpions, snails, small vertebrates, and mushrooms. They are primarily frugivorous, with fruit making up over 50% of their diet. They use their large canines to crack open hard nuts and defend against predators.",
    "meerkat": "Meerkats are omnivores that spend much of their day foraging, digging in sand and soil for insects, larvae, spiders, scorpions, centipedes, small vertebrates, eggs, tubers, and roots. They are immune to certain venoms, allowing them to eat scorpions and some venomous snakes. A sentry always stands guard while the group forages.",
    "moose": "Moose are herbivores that browse on leaves, bark, and twigs of deciduous trees and shrubs, as well as aquatic vegetation. In summer, they wade into lakes and ponds to eat water lilies and pondweed, sometimes fully submerging their heads. They consume up to 60 pounds of food per day during peak seasons.",
    "mountain-lion": "Mountain lions (cougars) are obligate carnivores that primarily hunt deer, especially mule deer and white-tailed deer. They also take elk, bighorn sheep, rabbits, and other small mammals. They are ambush predators that stalk prey and deliver a powerful killing bite to the neck or base of the skull.",
    "nile-crocodile": "Nile crocodiles are apex carnivores with an extremely powerful bite. They prey on fish, birds, zebras, wildebeest, buffalo, and virtually any animal that comes to the water's edge. They use a 'death roll' to tear apart large prey. Juveniles eat insects and small fish, graduating to larger prey as they grow.",
    "orangutan": "Orangutans are primarily frugivores, with fruit making up about 60% of their diet. They also eat leaves, bark, flowers, insects, bird eggs, and honey. They are known to use tools — fashioning sticks to extract insects from tree holes or honey from beehives. They have excellent spatial memory for locating fruiting trees.",
    "orca": "Orcas are apex predators with the most diverse diet of any marine mammal. Different populations specialize in different prey: some eat primarily salmon, others hunt marine mammals like seals, sea lions, and even great whales. They use sophisticated cooperative hunting techniques including wave-washing seals off ice floes and carousel feeding on fish schools.",
    "ostrich": "Ostriches are omnivores that eat primarily plant matter including roots, leaves, flowers, and seeds. They also consume insects, lizards, and other small animals. They swallow pebbles to help grind food in their gizzard. Lacking teeth, they rely on this gastrolith system to process the 8 pounds of food they eat daily.",
    "platypus": "Platypuses are carnivores that feed on aquatic invertebrates including insect larvae, freshwater shrimp, worms, and yabbies. They forage on river bottoms using their electroreceptive bills to detect the tiny electrical fields generated by prey's muscle contractions. They store caught prey in cheek pouches and chew it at the surface.",
    "polar-bear": "Polar bears are hypercarnivores that primarily hunt ringed and bearded seals, using sea ice as a hunting platform. They wait by breathing holes or stalk seals resting on ice. They eat mainly the fat-rich blubber and skin. During ice-free periods, they may eat bird eggs, berries, and kelp, though these are insufficient for long-term survival.",
    "raccoon": "Raccoons are highly adaptable omnivores that eat crayfish, frogs, fish, insects, bird eggs, fruits, nuts, seeds, and human refuse. They are known for 'washing' their food in water, which actually enhances their tactile sense. In urban areas, they readily exploit garbage cans, pet food, and garden produce.",
    "red-kangaroo": "Red kangaroos are herbivores that graze primarily on grasses, forbs, and shrubs across the Australian outback. They prefer green, fresh grass and can go long periods without water by obtaining moisture from their food. They have a specialized chambered stomach similar to ruminants that allows them to ferment and extract nutrients from tough vegetation.",
    "red-panda": "Red pandas are primarily herbivores that feed almost exclusively on bamboo leaves and shoots, supplemented with fruits, berries, acorns, roots, and occasionally bird eggs and insects. Despite being classified as carnivores, bamboo makes up about 95% of their diet. They have a modified wrist bone that acts as a 'thumb' for gripping bamboo.",
    "siberian-tiger": "Siberian tigers are apex carnivores that hunt large ungulates including elk, wild boar, sika deer, and moose. They are solitary ambush hunters that stalk prey before launching a short, powerful charge. A tiger can consume up to 60 pounds of meat in one night. They require about 20 pounds of meat per day on average.",
    "snow-leopard": "Snow leopards are carnivores that prey primarily on blue sheep (bharal) and Siberian ibex in high mountain terrain. They also hunt marmots, hares, pikas, and game birds. They are capable of taking down prey three times their own weight, ambushing from above using rocky terrain for concealment.",
    "spotted-hyena": "Spotted hyenas are both predators and scavengers. They hunt in clans, taking down wildebeest, zebras, antelope, and buffalo. Their incredibly powerful jaws generate 1,100 PSI of bite force, allowing them to crush bones and consume virtually every part of a carcass including hooves, horns, and teeth.",
    "tasmanian-devil": "Tasmanian devils are carnivores and scavengers with the most powerful bite relative to body size of any living mammal. They eat carrion, small mammals, birds, insects, and occasionally livestock. Their powerful jaws can crush bone, and they consume the entire carcass including fur and bones, wasting nothing.",
    "three-toed-sloth": "Three-toed sloths are herbivores that feed almost exclusively on leaves from a variety of tropical trees, especially Cecropia. Their specialized, multi-chambered stomachs slowly ferment the tough leaves over about a month. They have a very low metabolic rate, which matches their low-energy leaf diet.",
    "toucan": "Toucans are primarily frugivores, using their large colorful bills to reach and pluck fruit from branch tips. They eat a wide variety of tropical fruits, supplemented with insects, spiders, small lizards, tree frogs, and bird eggs. They play an important role as seed dispersers in tropical forest ecosystems.",
    "wandering-albatross": "Wandering albatrosses are carnivores that feed mainly on squid, fish, and crustaceans, often foraging at night when squid rise to the surface. They also scavenge from fishing boats and feed on carrion. They can cover vast distances — up to 600 miles in a single day — while searching for food across the open ocean.",
    "white-rhinoceros": "White rhinos are herbivores and the largest pure grazers on Earth. They feed almost exclusively on short grasses, using their wide, flat lips to efficiently crop grass close to the ground. They eat up to 120 pounds of grass per day and need to drink water daily, though they can survive up to 5 days without it.",
    "wombat": "Wombats are herbivores that graze on native grasses, sedges, herbs, bark, and roots. They have rodent-like continuously growing teeth adapted for tough vegetation. Their digestive process is remarkably slow, taking 14-18 days to complete, which allows maximum nutrient extraction. Their cube-shaped droppings are used to mark territory.",
    "zebra": "Zebras are herbivores that graze primarily on grasses, spending up to 18 hours a day feeding. They prefer short, young grass and are among the first grazers to enter tall-grass areas, cropping the tops and making it accessible for other species. They also eat shrubs, herbs, twigs, leaves, and bark during dry seasons.",
}

async def fix():
    engine = create_async_engine(get_settings().DATABASE_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as db:
        r = await db.execute(
            select(Animal).where(
                (Animal.diet_detail == None) | (Animal.diet_detail == "")
            )
        )
        animals = r.scalars().all()
        count = 0
        for a in animals:
            if a.slug in DIET_DETAILS:
                a.diet_detail = DIET_DETAILS[a.slug]
                count += 1
                print(f"  Updated: {a.common_name}")
            else:
                print(f"  WARNING: No data for {a.common_name} ({a.slug})")
        await db.commit()
        print(f"\nUpdated diet_detail for {count} animals")

        # Final stats
        from sqlalchemy import func
        r2 = await db.execute(select(func.count()).where(Animal.hero_image_url == None))
        print(f"Missing images: {r2.scalar()}")
        r3 = await db.execute(select(func.count()).where((Animal.predators == None) | (Animal.predators == '')))
        print(f"Missing predators: {r3.scalar()}")
        r4 = await db.execute(select(func.count()).where((Animal.prey == None) | (Animal.prey == '')))
        print(f"Missing prey: {r4.scalar()}")
        r5 = await db.execute(select(func.count()).where((Animal.diet_detail == None) | (Animal.diet_detail == '')))
        print(f"Missing diet_detail: {r5.scalar()}")
        r6 = await db.execute(select(func.count()).select_from(Animal))
        print(f"Total animals: {r6.scalar()}")
    await engine.dispose()

asyncio.run(fix())
