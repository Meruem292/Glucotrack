import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "@/lib/firebase";
import { getHealthStatus } from "@/lib/utils";
import BeefTapaGarlicRedRiceandSlicedPapaya from "@/assets/foods/BeefTapaGarlicRedRiceandSlicedPapaya.jpg";
import BistekTagalogRedRiceandPineappleChunks from "@/assets/foods/BistekTagalogRedRiceandPineappleChunks.jpg";
import ChickenAfritadawithBrowRiceandFreshPineapple from "@/assets/foods/ChickenAfritadawithBrowRiceandFreshPineapple.jpg";
import ChickenCalderetaKamoteMashandOrange from "@/assets/foods/ChickenCalderetaKamoteMashandOrange.jpg";
import ChickenCurrywithQuinoaRicePapaya from "@/assets/foods/ChickenCurrywithQuinoaRicePapaya.jpg";
import ChickenInasalNoSkinWithBrownRicePechayGuisado from "@/assets/foods/ChickenInasalNoSkinWithBrownRicePechayGuisado.jpg";
import GinataangKalabasawithSitawLeanChicken from "@/assets/foods/GinataangKalabasawithSitawLeanChicken.jpg";
import GrilledBangusGarlicRedRiceandAppleWedges from "@/assets/foods/GrilledBangusGarlicRedRiceandAppleWedges.jpg";
import GrilledBangusMilkfishwithEnseladangTalongBrownRice from "@/assets/foods/GrilledBangusMilkfishwithEnseladangTalongBrownRice.jpg";
import GrilledTilapiawithEnsaladangTalongandApple from "@/assets/foods/GrilledTilapiawithEnsaladangTalongandApple.jpg";
import PinakbetwithFriedTilapiaandBrownRice from "@/assets/foods/PinakbetwithFriedTilapiaandBrownRice.jpg";
import PorkSinigangwithKangkongandKamoteRice from "@/assets/foods/PorkSinigangwithKangkongandKamoteRice.jpg";
import TofuAdobowithBrownRiceSweetCorn from "@/assets/foods/TofuAdobowithBrownRiceSweetCorn.jpg";
import TofuLumpiawithVinegarDipandRedRice from "@/assets/foods/TofuLumpiawithVinegarDipandRedRice.jpg";
import ChickenAdobowithBrownRiceSlicedPapaya from "@/assets/foods/ChickenAdobowithBrownRiceSlicedPapaya.jpg";
import ChickenArrozCaldowithBoiledEgg from "@/assets/foods/ChickenArrozCaldowithBoiledEgg.jpg";
import TinapangBanguswithGarlicBrownRice from "@/assets/foods/TinapangBanguswithGarlicBrownRice.jpg";
import TuyowithTomatoesandBrownRices from "@/assets/foods/TuyowithTomatoesandBrownRices.jpg";
import LumpiangSariwawithEgg from "@/assets/foods/LumpiangSariwawithEgg.jpg";
import TinolangManokwithSayoteandMalunggay from "@/assets/foods/TinolangManokwithSayoteandMalunggay.jpg";
import GinataangMaisBrownRicewithMuscovadoSugar from "@/assets/foods/GinataangMaisBrownRicewithMuscovadoSugar.jpg";
import TortangTalongwithGarlicRiceFruitSalad from "@/assets/foods/TortangTalongwithGarlicRiceFruitSalad.jpg";
import ScrambledEggswithMalunggayWholeWheatPandesalwithHoney from "@/assets/foods/ScrambledEggswithMalunggayWholeWheatPandesalwithHoney.jpg";
import ScrambledEggswithMalunggayWholeWheatPandesal from "@/assets/foods/ScrambledEggswithMalunggayWholeWheatPandesal.jpg";
import SardinaswithBoiledEggBlanchedAmpalaya from "@/assets/foods/SardinaswithBoiledEggBlanchedAmpalaya.jpg";
import Tokwa_tBaboywithCauliflowerRice from "@/assets/foods/Tokwa_tBaboywithCauliflowerRice.jpg";
import BeefTapawithGarlicBrownRiceRipeMango from "@/assets/foods/BeefTapawithGarlicBrownRiceRipeMango.jpg";
import BeefTapawithGarlicRedRiceCucumberTomatoSalad from "@/assets/foods/BeefTapawithGarlicRedRiceCucumberTomatoSalad.jpg";

interface Reading {
  glucose: number;
  heartRate: number;
  spo2: number;
  timestamp: number;
}

interface FoodItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

export default function FoodRecommendations() {
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [foodRecommendations, setFoodRecommendations] = useState<FoodItem[]>(
    [],
  );

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const readingsRef = ref(database, `users/${userId}/readings`);
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const readings = Object.values(data) as Reading[];
        const latestReading =
          readings.sort((a, b) => b.timestamp - a.timestamp)[0] || null;
        setLatestReading(latestReading);

        if (latestReading) {
          fetchFoodRecommendations(latestReading);
        }
      } else {
        setLatestReading(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchFoodRecommendations = (reading: Reading) => {
    const recommendations: FoodItem[] = [
      {
        id: "1",
        name: "Grilled Salmon",
        description:
          "Rich in omega-3 fatty acids that support heart health and may help regulate blood sugar.",
        imageUrl:
          "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["protein-rich", "low-glycemic"],
      },
      {
        id: "2",
        name: "Mixed Green Salad",
        description:
          "Leafy greens provide essential nutrients and fiber that help manage blood glucose levels.",
        imageUrl:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["high-fiber", "low-calorie"],
      },
      {
        id: "3",
        name: "Overnight Oats",
        description:
          "Whole grain oats provide slow-releasing carbohydrates to maintain stable blood sugar levels.",
        imageUrl:
          "https://images.unsplash.com/photo-1568093858174-0f391ea21c45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["high-fiber", "medium-glycemic"],
      },
      {
        id: "4",
        name: "Greek Yogurt with Berries",
        description:
          "High in protein and probiotics with antioxidant-rich berries to support gut health.",
        imageUrl:
          "https://images.unsplash.com/photo-1488477181946-6428a0bfdf63?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["protein-rich", "probiotic"],
      },
      {
        id: "5",
        name: "Avocado Toast on Whole Grain",
        description:
          "Healthy fats and fiber to help maintain steady blood sugar levels throughout the day.",
        imageUrl:
          "https://images.unsplash.com/photo-1506974210756-8e1b8985d348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["heart-healthy", "high-fiber"],
      },
      {
        id: "6",
        name: "Quinoa Bowl with Vegetables",
        description:
          "Complete protein with complex carbs for sustained energy and stable glucose.",
        imageUrl:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["protein-rich", "high-fiber"],
      },
      {
        id: "7",
        name: "Chicken Adobo with Brown Rice & Sliced Papaya",
        description:
          "Complete protein with complex carbs for sustained energy and stable glucose.",
        imageUrl: ChickenAdobowithBrownRiceSlicedPapaya,
        tags: ["protein-rich", "high-fiber"],
      },
      {
        id: "8",
        name: "Chicken Arroz Caldo with Boiled Egg",
        description:
          "A warm rice porridge that's gentle on the stomach and provides steady energy with ginger's anti-inflammatory benefits.",
        imageUrl: ChickenArrozCaldowithBoiledEgg,
        tags: ["high-fiber", "medium-glycemic"],
      },
      {
        id: "9",
        name: "Tinapang Bangus with Garlic Brown Rice",
        description:
          "Smoked milkfish rich in protein and omega-3, promoting heart health and glucose regulation.",
        imageUrl: TinapangBanguswithGarlicBrownRice,
        tags: ["protein-rich", "heart-healthy"],
      },
      {
        id: "10",
        name: "Tuyo with Tomatoes and Brown Rices",
        description:
          "A classic Filipino breakfast of dried fish served with fresh tomatoes and fiber-rich brown rice, providing protein and steady energy.",
        imageUrl: TuyowithTomatoesandBrownRices,
        tags: ["protein-rich", "low-glycemic"],
      },
      {
        id: "11",
        name: "Lumpiang Sariwa with Egg",
        description:
          "Fresh vegetable rolls that are high in fiber, vitamins, and minerals—great for digestion and glucose stability.",
        imageUrl: LumpiangSariwawithEgg,
        tags: ["high-fiber", "low-calorie"],
      },
      {
        id: "12",
        name: "Tinolang Manok with Sayote and Malunggay",
        description:
          "A light and nourishing chicken soup with sayote and malunggay, rich in vitamins and antioxidants for immune and digestive health.",
        imageUrl: TinolangManokwithSayoteandMalunggay,
        tags: ["low-glycemic", "heart-healthy", "high-fiber"],
      },
      {
        id: "13",
        name: "Ginataang Mais (Brown Rice) with Muscovado Sugar",
        description:
          "A warm coconut milk corn porridge made with brown rice and lightly sweetened with muscovado sugar. Ideal for a gentle blood sugar boost",
        imageUrl: GinataangMaisBrownRicewithMuscovadoSugar,
        tags: ["high-fiber", "heart-healthy", "medium-glycemic"],
      },
      {
        id: "14",
        name: "Tortang Talong with Garlic Rice & Fruit Salad",
        description:
          "Grilled eggplant omelette paired with garlic fried rice and a side of sweet tropical fruit salad for balanced energy.",
        imageUrl: TortangTalongwithGarlicRiceFruitSalad,
        tags: [
          "protein-rich",
          "high-fiber",
          "heart-healthy",
          "medium-glycemic",
        ],
      },
      // {
      //   id: "15",
      //   name: "Scrambled Eggs with Malunggay & Whole-Wheat Pandesal with Honey",
      //   description:
      //     "Fluffy scrambled eggs with nutrient-rich malunggay leaves, served with whole-wheat pandesal drizzled with honey for a mild glucose lift.",
      //   imageUrl: ScrambledEggswithMalunggayWholeWheatPandesalwithHoney,
      //   tags: ["protein-rich", "high-fiber", "low-glycemic", "heart-healthy"],
      // },
      {
        id: "16",
        name: "Scrambled Eggs with Malunggay & Whole-Wheat Pandesal",
        description:
          "A wholesome breakfast featuring protein-rich scrambled eggs with malunggay leaves and fiber-packed whole-wheat pandesal. Low in sugar, high in nutrients.",
        imageUrl: ScrambledEggswithMalunggayWholeWheatPandesal,
        tags: [
          "protein-rich",
          "high-fiber",
          "low-glycemic",
          "heart-healthy",
          "low-calorie",
        ],
      },
      {
        id: "17",
        name: "Sardinas with Boiled Egg & Blanched Ampalaya",
        description:
          "Savory sardines paired with a boiled egg and lightly blanched bitter melon—great for managing glucose levels and boosting protein intake.",
        imageUrl: SardinaswithBoiledEggBlanchedAmpalaya,
        tags: ["protein-rich", "heart-healthy", "low-glycemic", "low-calorie"],
      },
      {
        id: "18",
        name: "Tokwa't Baboy with Cauliflower Rice",
        description:
          "A high-protein Filipino classic made lighter with tofu and pork belly served over low-carb cauliflower rice, ideal for glucose control.",
        imageUrl: Tokwa_tBaboywithCauliflowerRice,
        tags: ["protein-rich", "low-glycemic", "heart-healthy", "low-calorie"],
      },
      {
        id: "19",
        name: "Beef Tapa with Garlic Brown Rice & Ripe Mango",
        description:
          "Lean beef tapa served with fiber-rich garlic brown rice and a slice of ripe mango for a balanced and energizing midday meal.",
        imageUrl: BeefTapawithGarlicBrownRiceRipeMango,
        tags: [
          "protein-rich",
          "high-fiber",
          "medium-glycemic",
          "heart-healthy",
        ],
      },
      {
        id: "20",
        name: "Tofu Adobo with Brown Rice & Sweet Corn",
        description:
          "A plant-based take on adobo using tofu, paired with brown rice and sweet corn, delivering high fiber and low-glycemic benefits.",
        imageUrl: TofuAdobowithBrownRiceSweetCorn,
        tags: [
          "protein-rich",
          "high-fiber",
          "low-glycemic",
          "heart-healthy",
          "low-calorie",
        ],
      },
      {
        id: "21",
        name: "Chicken Curry with Quinoa Rice & Papaya",
        description:
          "Flavorful chicken curry served over quinoa rice, with fresh papaya on the side—perfect for sustained energy and blood sugar balance.",
        imageUrl: ChickenCurrywithQuinoaRicePapaya,
        tags: ["protein-rich", "high-fiber", "low-glycemic", "heart-healthy"],
      },
      {
        id: "22",
        name: "Beef Tapa with Garlic Red Rice & Cucumber-Tomato Salad",
        description:
          "A classic Filipino dish with tender beef tapa served over antioxidant-rich garlic red rice, paired with a refreshing cucumber-tomato salad for added fiber and hydration.",
        imageUrl: BeefTapawithGarlicRedRiceCucumberTomatoSalad,
        tags: [
          "protein-rich",
          "high-fiber",
          "medium-glycemic",
          "heart-healthy",
        ],
      },
      {
        id: "23",
        name: "Chicken Inasal (No Skin) With Brown Rice & Pechay Guisado",
        description:
          "Grilled skinless chicken inasal offers lean protein, paired with fiber-rich brown rice and sautéed pechay for a nutrient-packed, diabetes-friendly meal.",
        imageUrl: ChickenInasalNoSkinWithBrownRicePechayGuisado,
        tags: [
          "protein-rich",
          "low-glycemic",
          "high-fiber",
          "heart-healthy",
          "low-calorie",
        ],
      },
      {
        id: "24",
        name: "Grilled Bangus (Milkfish) with Enseladang Talong & Brown Rice",
        description:
          "Omega-3-rich bangus grilled to perfection, served with tangy eggplant salad and brown rice to support heart health and stabilize blood sugar levels.",
        imageUrl: GrilledBangusMilkfishwithEnseladangTalongBrownRice,
        tags: [
          "heart-healthy",
          "high-fiber",
          "medium-glycemic",
          "low-calorie",
          "protein-rich",
        ],
      },
      {
        id: "25",
        name: "Ginataang Kalabasa with Sitaw & Lean Chicken",
        description:
          "A creamy vegetable dish made with squash and string beans cooked in coconut milk, enhanced with lean chicken for a balanced, fiber-rich meal.",
        imageUrl: GinataangKalabasawithSitawLeanChicken,
        tags: [
          "high-fiber",
          "heart-healthy",
          "medium-glycemic",
          "protein-rich",
        ],
      },
      {
        id: "26",
        name: "Chicken Afritada with Brown Rice and Fresh Pineapple",
        description:
          "Tender chicken cooked in a savory tomato sauce with vegetables, served with fiber-rich brown rice and fresh pineapple to help restore low blood sugar levels.",
        imageUrl: ChickenAfritadawithBrowRiceandFreshPineapple,
        tags: [
          "medium-glycemic",
          "protein-rich",
          "high-fiber",
          "heart-healthy",
        ],
      },
      {
        id: "27",
        name: "Beef Tapa, Garlic Red Rice and Sliced Papaya",
        description:
          "A flavorful serving of marinated beef tapa, paired with red rice and sweet papaya for a satisfying meal that supports stable energy release.",
        imageUrl: BeefTapaGarlicRedRiceandSlicedPapaya,
        tags: ["medium-glycemic", "protein-rich", "heart-healthy"],
      },
      {
        id: "28",
        name: "Bistek Tagalog, Red Rice and Pineapple Chunks",
        description:
          "Classic Filipino beef steak in citrus-soy marinade, served with red rice and juicy pineapple to balance iron-rich protein with natural sugars.",
        imageUrl: BistekTagalogRedRiceandPineappleChunks,
        tags: ["medium-glycemic", "protein-rich", "heart-healthy"],
      },
      {
        id: "29",
        name: "Chicken Caldereta, Kamote Mash and Orange",
        description:
          "A hearty tomato-based chicken stew served with mashed sweet potatoes for complex carbs, and an orange for a refreshing dose of vitamin C.",
        imageUrl: ChickenCalderetaKamoteMashandOrange,
        tags: [
          "medium-glycemic",
          "protein-rich",
          "heart-healthy",
          "high-fiber",
        ],
      },
      {
        id: "30",
        name: "Grilled Bangus, Garlic Red Rice and Apple Wedges",
        description:
          "Grilled milkfish rich in omega-3, paired with garlicky red rice and fresh apple wedges for a balanced and nourishing dinner.",
        imageUrl: GrilledBangusGarlicRedRiceandAppleWedges,
        tags: ["medium-glycemic", "heart-healthy", "high-fiber", "low-calorie"],
      },
      {
        id: "31",
        name: "Grilled Tilapia with Ensaladang Talong and Apple",
        description:
          "Lightly seasoned grilled tilapia served with roasted eggplant salad and crisp apple slices for a wholesome and filling evening meal.",
        imageUrl: GrilledTilapiawithEnsaladangTalongandApple,
        tags: ["low-glycemic", "heart-healthy", "low-calorie", "high-fiber"],
      },
      {
        id: "32",
        name: "Pinakbet with Fried Tilapia and Brown Rice",
        description:
          "A vegetable-rich Ilocano dish with fried tilapia and fiber-packed brown rice, providing balanced nutrition while supporting glucose control.",
        imageUrl: PinakbetwithFriedTilapiaandBrownRice,
        tags: ["low-glycemic", "high-fiber", "heart-healthy", "protein-rich"],
      },
      {
        id: "33",
        name: "Pork Sinigang with Kangkong and Kamote Rice",
        description:
          "A tangy tamarind-based pork soup with nutrient-rich kangkong and kamote rice, offering a flavorful, fiber-friendly dinner.",
        imageUrl: PorkSinigangwithKangkongandKamoteRice,
        tags: [
          "medium-glycemic",
          "heart-healthy",
          "high-fiber",
          "protein-rich",
        ],
      },
      {
        id: "34",
        name: "Tofu Lumpia with Vinegar Dip and Red Rice",
        description:
          "Crispy tofu-stuffed spring rolls served with red rice and a tangy vinegar dip—rich in plant protein and fiber, ideal for sugar-conscious meals.",
        imageUrl: TofuLumpiawithVinegarDipandRedRice,
        tags: ["low-glycemic", "high-fiber", "low-calorie", "protein-rich"],
      },
    ];

    setFoodRecommendations(recommendations);
  };

  const filteredFoods =
    activeCategory === "all"
      ? foodRecommendations
      : foodRecommendations.filter((food) =>
          food.tags.includes(activeCategory),
        );

  const glucoseStatus = latestReading
    ? getHealthStatus("glucose", latestReading.glucose)
    : { status: "Unknown", color: "muted" };
  const heartRateStatus = latestReading
    ? getHealthStatus("heartRate", latestReading.heartRate)
    : { status: "Unknown", color: "muted" };
  const spo2Status = latestReading
    ? getHealthStatus("spo2", latestReading.spo2)
    : { status: "Unknown", color: "muted" };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold">Food Recommendations</h2>

      <div className="mb-6 rounded-xl bg-secondary p-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Based on your latest readings:
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div
              className={`mr-2 h-3 w-3 rounded-full bg-${glucoseStatus.color}`}
            ></div>
            <span className="text-sm">
              Glucose:{" "}
              <span className="font-medium">
                {latestReading?.glucose || 0} mg/dL
              </span>
            </span>
          </div>
          <div className="flex items-center">
            <div
              className={`mr-2 h-3 w-3 rounded-full bg-${heartRateStatus.color}`}
            ></div>
            <span className="text-sm">
              Heart Rate:{" "}
              <span className="font-medium">
                {latestReading?.heartRate || 0} BPM
              </span>
            </span>
          </div>
          <div className="flex items-center">
            <div
              className={`mr-2 h-3 w-3 rounded-full bg-${spo2Status.color}`}
            ></div>
            <span className="text-sm">
              SpO2:{" "}
              <span className="font-medium">{latestReading?.spo2 || 0}%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        {[
          "all",
          "low-glycemic",
          "heart-healthy",
          "protein-rich",
          "high-fiber",
        ].map((category) => (
          <button
            key={category}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
              activeCategory === category
                ? "bg-accent text-white"
                : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category === "all"
              ? "All Recommendations"
              : category
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <div
              key={food.id}
              className="overflow-hidden rounded-xl bg-secondary"
            >
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${food.imageUrl})` }}
              ></div>
              <div className="p-4">
                <h3 className="mb-1 font-medium">{food.name}</h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  {food.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {food.tags.map((tag, index) => {
                    let bgColor = "bg-accent/10";
                    let textColor = "text-accent";

                    if (tag === "low-glycemic" || tag === "low-calorie") {
                      bgColor = "bg-success/10";
                      textColor = "text-success";
                    } else if (tag === "medium-glycemic") {
                      bgColor = "bg-warning/10";
                      textColor = "text-warning";
                    }

                    return (
                      <span
                        key={index}
                        className={`rounded-full px-2 py-1 text-xs ${bgColor} ${textColor}`}
                      >
                        {tag.replace("-", " ")}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No food recommendations available for this category.
          </div>
        )}
      </div>
    </div>
  );
}
