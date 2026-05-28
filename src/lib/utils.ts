import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPlayerCountry(name: string): string {
  if (!name) return "Other";
  const n = name.toLowerCase();
  
  // India
  if (
    n.includes("kohli") || n.includes("bumrah") || n.includes("rohit") || n.includes("sharma") || 
    n.includes("dhoni") || n.includes("tendulkar") || n.includes("jadeja") || n.includes("ashwin") || 
    n.includes("gill") || n.includes("rahul") || n.includes("pant") || n.includes("pandya") || 
    n.includes("jaiswal") || n.includes("iyer") || n.includes("samson") || n.includes("suryakumar") || 
    n.includes("chahal") || n.includes("kuldeep") || n.includes("siraj") || n.includes("shami") || 
    n.includes("bhuvneshwar") || n.includes("axar") || n.includes("rahane") || n.includes("pujara") || 
    n.includes("sehwag") || n.includes("dravid") || n.includes("ganguly") || n.includes("laxman") || 
    n.includes("gambhir") || n.includes("yuvraj") || n.includes("raina") || n.includes("dhawan") ||
    n.includes("dube") || n.includes("rinku") || n.includes("jurel") || n.includes("bihari") || 
    n.includes("shankar") || n.includes("prasidh") || n.includes("bhanuka")
  ) {
    return "India";
  }
  
  // Australia
  if (
    n.includes("cummins") || n.includes("smith") || n.includes("warner") || n.includes("labuschagne") || 
    n.includes("head") || n.includes("marsh") || n.includes("starc") || n.includes("hazlewood") || 
    n.includes("lyon") || n.includes("maxwell") || n.includes("green") || n.includes("carey") || 
    n.includes("zampa") || n.includes("wade") || n.includes("stoinis") || n.includes("finch") || 
    n.includes("ponting") || n.includes("clarke") || n.includes("hussey") || n.includes("gilchrist") || 
    n.includes("hayden") || n.includes("mcgrath") || n.includes("warne") || n.includes("langer") || 
    n.includes("watson") || n.includes("johnson") || n.includes("khawaja") || n.includes("handscomb") ||
    n.includes("inglis") || n.includes("david") || n.includes("agar") || n.includes("behrendorff")
  ) {
    return "Australia";
  }
  
  // England
  if (
    n.includes("stokes") || n.includes("root") || n.includes("buttler") || n.includes("brook") || 
    n.includes("bairstow") || n.includes("anderson") || n.includes("broad") || n.includes("wood") || 
    n.includes("rashid") || n.includes("ali") || n.includes("archer") || n.includes("crawley") || 
    n.includes("duckett") || n.includes("pope") || n.includes("woakes") || n.includes("curran") || 
    n.includes("roy") || n.includes("morgan") || n.includes("cook") || n.includes("pietersen") || 
    n.includes("flintoff") || n.includes("salt") || n.includes("hartley") || n.includes("ahmed") ||
    n.includes("tongue") || n.includes("carse") || n.includes("livingstone") || n.includes("jacks")
  ) {
    return "England";
  }
  
  // Pakistan
  if (
    n.includes("babar") || n.includes("azam") || n.includes("rizwan") || n.includes("shaheen") || 
    n.includes("afridi") || n.includes("naseem") || n.includes("rauf") || n.includes("shadab") || 
    n.includes("fakhar") || n.includes("zaman") || n.includes("imam") || n.includes("masood") || 
    n.includes("iftikhar") || n.includes("imad") || n.includes("wasim") || n.includes("amir") || 
    n.includes("inzamam") || n.includes("younis") || n.includes("misbah") || n.includes("malik") || 
    n.includes("hafeez") || n.includes("akhtar") || n.includes("saim") || n.includes("ayub") ||
    n.includes("haris") || n.includes("abrar") || n.includes("hasan") || n.includes("dahani")
  ) {
    return "Pakistan";
  }
  
  // South Africa
  if (
    n.includes("rabada") || n.includes("de villiers") || n.includes("du plessis") || n.includes("miller") || 
    n.includes("de kock") || n.includes("bavuma") || n.includes("markram") || n.includes("klaasen") || 
    n.includes("jansen") || n.includes("maharaj") || n.includes("coetzee") || n.includes("ngidi") || 
    n.includes("nortje") || n.includes("steyn") || n.includes("morkel") || n.includes("kallis") || 
    n.includes("amla") || n.includes("tahir") || n.includes("elgar") || n.includes("stubbs") ||
    n.includes("rickelton") || n.includes("breetzke") || n.includes("burger") || n.includes("phehlukwayo")
  ) {
    return "South Africa";
  }
  
  // New Zealand
  if (
    n.includes("williamson") || n.includes("boult") || n.includes("southee") || n.includes("mitchell") || 
    n.includes("latham") || n.includes("conway") || n.includes("phillips") || n.includes("santner") || 
    n.includes("ravindra") || n.includes("henry") || n.includes("ferguson") || n.includes("bracewell") || 
    n.includes("guptill") || n.includes("taylor") || n.includes("mccullum") || n.includes("vettori") || 
    n.includes("fleming") || n.includes("chapman") || n.includes("seifert") || n.includes("sodhi") ||
    n.includes("jamieson") || n.includes("milne") || n.includes("o'rourke") || n.includes("sears")
  ) {
    return "New Zealand";
  }
  
  // West Indies
  if (
    n.includes("gayle") || n.includes("russell") || n.includes("pooran") || n.includes("hetmyer") || 
    n.includes("hope") || n.includes("joseph") || n.includes("holder") || n.includes("chase") || 
    n.includes("powell") || n.includes("king") || n.includes("shepherd") || n.includes("hosein") || 
    n.includes("narine") || n.includes("pollard") || n.includes("bravo") || n.includes("sammy") || 
    n.includes("chanderpaul") || n.includes("lara") || n.includes("sarwan") || n.includes("walsh") || 
    n.includes("ambrose") || n.includes("carty") || n.includes("motie") ||
    n.includes("rutherford") || n.includes("thomas") || n.includes("cariah")
  ) {
    return "West Indies";
  }
  
  // Sri Lanka
  if (
    n.includes("hasaranga") || n.includes("mendis") || n.includes("nissanka") || n.includes("samarawickrama") || 
    n.includes("asalanka") || n.includes("shanaka") || n.includes("theekshana") || n.includes("madushanka") || 
    n.includes("pathirana") || n.includes("karunaratne") || n.includes("mathews") || n.includes("de silva") || 
    n.includes("sangakkara") || n.includes("jayawardene") || n.includes("dilshan") || n.includes("muralitharan") || 
    n.includes("malinga") || n.includes("herath") || n.includes("chameera") || n.includes("rajitha") ||
    n.includes("wellalage") || n.includes("fernando") || n.includes("madushan")
  ) {
    return "Sri Lanka";
  }
  
  // Bangladesh
  if (
    n.includes("shakib") || n.includes("mushfiqur") || n.includes("tamim") || n.includes("mahmudullah") || 
    n.includes("litton") || n.includes("mustafizur") || n.includes("taskin") || n.includes("mehidy") || 
    n.includes("miraz") || n.includes("shanto") || n.includes("hridoy") || n.includes("shoriful") ||
    n.includes("tawhid") || n.includes("hasan") || n.includes("tanzim") || n.includes("rishad") ||
    n.includes("nasum") || n.includes("ebadat")
  ) {
    return "Bangladesh";
  }
  
  // Afghanistan
  if (
    n.includes("gurbaz") || n.includes("ibrahim") || n.includes("zadran") || n.includes("nabi") || 
    n.includes("mujib") || n.includes("mujeeb") || n.includes("naveen") || n.includes("farooqi") || 
    n.includes("omarzai") || n.includes("noor") || n.includes("janat") ||
    n.includes("ul-haq") || n.includes("shahidi") || n.includes("rahmat") || n.includes("ikram")
  ) {
    return "Afghanistan";
  }

  return "Other";
}

