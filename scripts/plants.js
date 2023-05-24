////GET all plants (lite)

const url = "https://house-plants2.p.rapidapi.com/all-lite"
const plantSection = document.querySelector("#plant-section")
const searchForm = document.querySelector("#search-form")

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "f2a4a9ae1amsh1f993993744a5c0p1d80e7jsn459d2fc1500d",
    "X-RapidAPI-Host": "house-plants2.p.rapidapi.com",
  },
}

function getPlantData() {
  const storedData = localStorage.getItem("plantData")
  //////Is the data already in local storage???
  if (storedData) {
    console.log("pulling from local")
    const parsedData = JSON.parse(storedData)
    // console.log(parsedData)
    return parsedData
  } else {
    /////// Fetch the data from the API if not available in local storage
    getPlantAPI()
  }
}

async function getPlantAPI() {
  try {
    const response = await fetch(url, options)
    const result = await response.json()
    localStorage.setItem("plantData", JSON.stringify(result))
    return result
  } catch (error) {
    console.error(error)
  }
}
//////this data is used for MOST things
const plantData = getPlantData()

//////have the selects already been added to the Search form?
if (searchForm.childElementCount === 0) {
  getSearchArray("Climat")
  getSearchArray("Categories")
  getSearchArray("Origin")
}

//////To get the care instructions for a single plant, I have to use the getById request:
async function getSinglePlantData(id) {
  const storedData = localStorage.getItem(`ID = ${id}`)
  //////Is the ID for the single plant already in local storage???
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData)
      console.log(`This is in local storage:`, parsedData)
      return parsedData
    } catch (error) {
      console.error("Error parsing local storage data:", error)
      localStorage.removeItem(`ID = ${id}`)
    }
  } else {
    const url = `https://house-plants2.p.rapidapi.com/id/${id}`
    try {
      const response = await fetch(url, options)
      const result = await response.json()
      localStorage.setItem(`ID = ${id}`, JSON.stringify(result))
      console.log(`This came from the API:`, result)
      return result
    } catch (error) {
      console.error("Error fetching data from API:", error)
    }
  }
}

//////getting the array for the dropdowns for Climate, Category and Origin
function getSearchArray(searchType) {
  let searchTypeArray = []
  for (let i = 0; i < plantData.length; i++) {
    //////sometimes the datatype for searchType is an array (like in the "Origin")
    if (Array.isArray(plantData[i][searchType])) {
      if (!searchTypeArray.includes(plantData[i][searchType][0])) {
        searchTypeArray.push(plantData[i][searchType][0])
      }
      ///////usually the datatype for searchType is just a string, so we handle it thus:
    } else {
      if (!searchTypeArray.includes(plantData[i][searchType])) {
        searchTypeArray.push(plantData[i][searchType])
      }
    }
  }
  searchTypeArray.sort()
  let name = getBetterName(searchType)

  renderDropdowns(searchTypeArray, name)
}

//////putting the dropdowns in dynamically, instead of through HTML
function renderDropdowns(optionsArray, name) {
  const nameLower = getBetterName(name)
  const searchName = `${nameLower}-select`
  const wrapper = document.createElement("div")
  const label = document.createElement("label")
  const select = document.createElement("select")
  const blankOption = document.createElement("option")

  wrapper.setAttribute("class", "dropdown-wrapper")
  label.setAttribute("for", searchName)
  label.innerHTML = `Search by ${nameLower}`
  select.setAttribute("id", searchName)
  select.setAttribute("name", searchName)
  select.setAttribute("class", searchName)

  blankOption.setAttribute("value", "")
  blankOption.disabled = true
  blankOption.selected = true
  blankOption.innerHTML = "Select an option"
  select.appendChild(blankOption)

  for (let i = 0; i < optionsArray.length; i++) {
    const option = document.createElement("option")
    option.setAttribute("value", optionsArray[i])
    option.innerHTML = optionsArray[i]
    select.appendChild(option)
  }
  searchForm.appendChild(wrapper)
  wrapper.appendChild(label)
  wrapper.appendChild(select)
}

//////ugggh, I hated how climate was misspelled, categories wasn't category and Origin is capitalized. so here is where I fix them.
function getBetterName(searchType) {
  let name = ""
  if (searchType == "Climat") {
    name = "climate"
  } else if (searchType == "Categories") {
    name = "category"
  } else {
    name = searchType.toLowerCase()
  }
  return name
}

function renderPlantInfo(data, searchType) {
  ////create elements
  let plantDiv = document.createElement("div")
  let commonName = document.createElement("p")
  let latinName = document.createElement("p")
  let plantImage = document.createElement("img")

  ////set attributes for styling
  plantDiv.setAttribute("class", "plant-div")
  commonName.setAttribute("class", "common-name")
  latinName.setAttribute("class", "latin-name")
  plantImage.setAttribute("class", "plant-image")
  plantImage.setAttribute("src", data["Img"])
  plantImage.setAttribute("loading", "lazy")
  plantImage.setAttribute("width", "150")
  plantImage.setAttribute("height", "150")

  ////formatting the commonName (because sometimes it's an array that smooshes several plant names together only seperated by a comma with no space)
  let commonNameValue = data["Common name"]
  let formattedCommonName = ""
  if (Array.isArray(commonNameValue)) {
    formattedCommonName = commonNameValue
      .map((name) => name.trim())
      .join("<br>")
  } else if (typeof commonNameValue === "string") {
    formattedCommonName = commonNameValue
  }

  //////getting the ID for the careDiv card
  const id = data["id"]

  //////getting a popup with info:
  plantDiv.addEventListener("click", function () {
    renderCareInstructions(formattedCommonName, id)
  })
  ////fill up the HTML
  // commonName.innerHTML = `Common name: <br>${data[i]["Common name"]}`
  commonName.innerHTML = `Common name: <br>${formattedCommonName}`
  latinName.innerHTML = `Latin name: <br>${data["Latin name"]}`

  ////append the things
  plantDiv.appendChild(plantImage)
  plantDiv.appendChild(commonName)
  plantDiv.appendChild(latinName)

  ////adding what the user searched by: climate, category, or origin. But ignore "name" because the name is put on all the cards.
  if (searchType !== "name") {
    const name = toTitleCase(getBetterName(searchType))
    const searchTypeP = document.createElement("p")
    searchTypeP.innerHTML = `${name}: <br>${data[searchType]}`
    plantDiv.appendChild(searchTypeP)
  }

  /////putting it all in the plant Section
  plantSection.appendChild(plantDiv)
}

//////the care instructions that popup when a card is clicked on
async function renderCareInstructions(name, id) {
  const data = await getSinglePlantData(id)

  //////create elements
  const careDiv = document.createElement("div")
  const identifiersDiv = document.createElement("div")
  const plantImage = document.createElement("img")
  const nameDiv = document.createElement("div")
  const lighting = document.createElement("p")
  const pruning = document.createElement("p")
  const watering = document.createElement("p")
  const temp = document.createElement("p")
  const height = document.createElement("p")
  const disease = document.createElement("p")
  const insects = document.createElement("p")

  const moreInfo = document.createElement("a")
  const closeBtn = document.createElement("button")

  //////set attributes for the elements
  careDiv.setAttribute("class", "care-div")
  careDiv.style.display = "block"
  identifiersDiv.setAttribute("class", "identifiers")
  nameDiv.setAttribute("class", "name-div")
  moreInfo.setAttribute("class", "more-info")
  moreInfo.setAttribute("href", data["Url"])
  moreInfo.setAttribute("target", "blank")
  closeBtn.setAttribute("class", "close-care-div")
  plantImage.setAttribute("class", "care-image")
  plantImage.setAttribute("src", data["Img"])
  plantImage.setAttribute("loading", "lazy")
  plantImage.setAttribute("width", "150")
  plantImage.setAttribute("height", "150")
  //////these two won't show up on the small screen
  disease.setAttribute("class", "small-screen")
  insects.setAttribute("class", "small-screen")

  //////get some info for these values:
  const heightInMeters = data["Height potential"]
  const heightString = getHeightString(heightInMeters)

  const tempString = getTempString(
    data["Temperature min"],
    data["Temperature max"]
  )

  const diseaseInfo = data["Disease"]
  const diseaseString = dealWithArrays(diseaseInfo)

  const insectInfo = data["Insects"]
  const insectString = dealWithArrays(insectInfo)

  //////inner HTML for the elements:
  nameDiv.innerHTML = name
  lighting.innerHTML = `Ideal light: ${data["Light ideal"]}`
  pruning.innerHTML = `Pruning: ${data["Pruning"]}`
  watering.innerHTML = `Watering: ${data["Watering"]}`
  temp.innerHTML = `${tempString}`
  height.innerHTML = heightString
  disease.innerHTML = `Typical Diseases: ${diseaseString}`
  insects.innerHTML = `Typical Insects: ${insectString}`

  moreInfo.innerHTML = "More Info"
  closeBtn.innerHTML = "X"

  ////// add the things to CareDiv

  identifiersDiv.appendChild(plantImage)
  identifiersDiv.appendChild(nameDiv)
  careDiv.appendChild(identifiersDiv)
  careDiv.appendChild(lighting)
  careDiv.appendChild(pruning)
  careDiv.appendChild(watering)
  careDiv.appendChild(temp)
  careDiv.appendChild(height)
  careDiv.appendChild(disease)
  careDiv.appendChild(insects)

  careDiv.appendChild(moreInfo)
  careDiv.appendChild(closeBtn)

  /////// add careDiv to the body so it can pop up on top of the current cards
  document.body.appendChild(careDiv)
  closeBtn.addEventListener("click", function () {
    closeCareDiv(careDiv)
  })
}

//////diseases and insects have arrays which is awful because we all know one insect or disease is one too many.
function dealWithArrays(key) {
  formattedKey = ""
  if (Array.isArray(key)) {
    formattedKey = key.map((name) => name.trim()).join(", ")
  } else if (typeof key === "string") {
    formattedKey = key
  }
  return formattedKey
}

//////simple function for closing the pop-up care div. Nice.
function closeCareDiv(careDiv) {
  careDiv.style.display = "none"
}

//////height is in Meters, which just makes sense, but since I live in the US and we have weird measuring I'm going to convert it to feet. Ugggh
function getHeightString(heightInfo) {
  let heightString = ""
  if (heightInfo === null) {
    heightString = `Height: Height data not specified`
    return heightString
  } else {
    const heightInMeters = heightInfo["M"]
    const heightInFeet = (heightInMeters * 3.28084).toFixed(2)

    heightString = `Full-grown height: ${heightInFeet} feet`
    return heightString
  }
}

//////sometimes the temperature that is returned doesn't have a Min or maybe it doesn't have a Max. uggggh. Here is how we deal with that:
function getTempString(min, max) {
  let tempString = ""
  if (min === null && max === null) {
    tempString = "Temp data not specified"
  } else if (min === null) {
    maxString = max["F"]
    tempString = `Max Temperature: ${maxString}&#xb0;F`
  } else if (max === null) {
    minString = min["F"]
    tempString = `Min Temperature: ${minString}&#xb0;F`
  } else {
    minString = min["F"]
    maxString = max["F"]

    tempString = `Temperature range: ${minString}&#xb0;F - ${maxString}&#xb0;F`
  }
  return tempString
}

////// searching by name fields
const nameForm = document.querySelector("#name-form")
const nameSelect = document.querySelector("#plant-name")
////// the dropdowns:
const climateSelect = document.querySelector("#climate-select")
const categorySelect = document.querySelector("#category-select")
const originSelect = document.querySelector("#origin-select")

//////Searching by name:
nameForm.addEventListener("submit", function (event) {
  event.preventDefault()
  climateSelect.value = ""
  categorySelect.value = ""
  originSelect.value = ""
  const originalName = nameSelect.value
  const nameValue = originalName.toUpperCase()
  if (nameSelect.value == "") {
    searchByName(nameValue, true, originalName)
  } else {
    searchByName(nameValue, false, originalName)
  }
})

function searchByName(nameValue, blankName, originalName) {
  let unknownPlant = true
  plantSection.innerHTML = ""
  for (let i = 0; i < plantData.length; i++) {
    const commonName = plantData[i]["Common name"]
    ////// "blankName" is for when the input box is blank and user clicks "submit". The reason I put this in here is because there are quite a few plants where the Common Name is blank. This pulls those plants up.
    if (blankName) {
      if (
        !commonName ||
        (Array.isArray(commonName) && commonName.length === 0)
      ) {
        renderPlantInfo(plantData[i], "name")
        unknownPlant = false
      }
      //////The following code is because the Common Name in the API pulls back either an Array or a String
    } else {
      if (
        //////if the Common Name has an array, then do this one.
        Array.isArray(commonName) &&
        commonName.some((name) => name.toUpperCase().includes(nameValue))
      ) {
        renderPlantInfo(plantData[i], "name")
        unknownPlant = false
      } else if (
        ///// else if the Common Name is a string, then do this one.
        typeof commonName === "string" &&
        commonName.toUpperCase().includes(nameValue)
      ) {
        renderPlantInfo(plantData[i], "name")
        unknownPlant = false
      }
    }
  }
  //////in case the user puts in a name for a plant that is not in the database
  if (unknownPlant) {
    printWarningSign(originalName)
  }
}

function printWarningSign(nameValue) {
  const warningDiv = document.createElement("div")
  warningDiv.setAttribute("class", "warning")
  warningDiv.innerHTML = `"${nameValue}" is not in the database. Please try again.`
  plantSection.appendChild(warningDiv)
}

/////Searching by climate:
climateSelect.addEventListener("change", function () {
  categorySelect.value = ""
  nameSelect.value = ""
  originSelect.value = ""
  const selectedClimate = this.value
  if (selectedClimate !== "") {
    searchByDropdown(selectedClimate, "Climat")
  }
})

//////searching by category:
categorySelect.addEventListener("change", function () {
  climateSelect.value = ""
  originSelect.value = ""
  nameSelect.value = ""
  const selectedCategory = this.value
  if (selectedCategory !== "") {
    searchByDropdown(selectedCategory, "Categories")
  }
})

////search by origin
originSelect.addEventListener("change", function () {
  categorySelect.value = ""
  climateSelect.value = ""
  nameSelect.value = ""
  const selectedOrigin = this.value
  if (selectedOrigin !== "") {
    searchByDropdown(selectedOrigin, "Origin")
  }
})

function searchByDropdown(selectChoice, selectType) {
  plantSection.innerHTML = ""
  for (let i = 0; i < plantData.length; i++) {
    ///////Because sometimes the value for the selectType is an Array (like "Origin")
    if (
      Array.isArray(plantData[i][selectType]) &&
      plantData[i][selectType][0] === selectChoice
    ) {
      renderPlantInfo(plantData[i], selectType)
    } else if (plantData[i][selectType] === selectChoice) {
      renderPlantInfo(plantData[i], selectType)
    }
  }
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}
