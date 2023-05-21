////GET all plants (lite)

const url = "https://house-plants2.p.rapidapi.com/all-lite"
const plantSection = document.getElementById("plant-section")

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

const plantData = getPlantData()

function renderPlantInfo(data, searchType) {
  ////create elements
  let plantDiv = document.createElement("div")
  let commonName = document.createElement("p")
  let latinName = document.createElement("p")
  let plantImage = document.createElement("img")

  ////set attributes for styling
  plantDiv.setAttribute("class", "plant-div")
  //////getting a popup with info:
  plantDiv.addEventListener("click", function () {
    renderCareInstructions()
  })
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

  ////fill up the HTML
  // commonName.innerHTML = `Common name: <br>${data[i]["Common name"]}`
  commonName.innerHTML = `Common name: <br>${formattedCommonName}`
  latinName.innerHTML = `Latin name: <br>${data["Latin name"]}`

  ////append the things
  plantDiv.appendChild(plantImage)
  plantDiv.appendChild(commonName)
  plantDiv.appendChild(latinName)

  ////adding what the user searched by, climate or category
  if (searchType === "climate") {
    let climateType = document.createElement("p")
    climateType.setAttribute("class", "climate")
    climateType.innerHTML = `Climate: <br>${data["Climat"]}`
    plantDiv.appendChild(climateType)
  } else if (searchType === "category") {
    let category = document.createElement("p")
    category.setAttribute("class", "category")
    category.innerHTML = `Category: <br>${data["Categories"]}`
    plantDiv.appendChild(category)
  }

  /////putting it all in the plant Section
  plantSection.appendChild(plantDiv)
}

//////the care instructions that popup when a card is clicked on
function renderCareInstructions() {
  //////create elements
  const careDiv = document.createElement("div")
  const commonName = document.createElement("p")
  const lighting = document.createElement("p")
  const pruning = document.createElement("p")
  const watering = document.createElement("p")
  const temp = document.createElement("p")
  const height = document.createElement("p")
  const moreInfo = document.createElement("a")

  const closeBtn = document.createElement("button")

  //////set attributes for the elements
  careDiv.setAttribute("class", "care-div")
  careDiv.style.display = "block"
  moreInfo.setAttribute("class", "more-info")
  closeBtn.setAttribute("class", "close-care-div")

  

  //////inner HTML for the elements:
  commonName.innerHTML = "Common Name: "
  lighting.innerHTML = "Ideal Light: "
  pruning.innerHTML = "Pruning: "
  watering.innerHTML = "Watering: "
  temp.innerHTML = "Temperature range: "
  height.innerHTML = "Height: "
  closeBtn.innerHTML = "Close"

  ////// add the things to CareDiv
  careDiv.appendChild(commonName)
  careDiv.appendChild(lighting)
  careDiv.appendChild(pruning)
  careDiv.appendChild(watering)
  careDiv.appendChild(temp)
  careDiv.appendChild(height)

  careDiv.appendChild(closeBtn)

  /////// add careDiv to the body so it can pop up on top of the current cards
  document.body.appendChild(careDiv)
  closeBtn.addEventListener("click", function () {
    closeCareDiv(careDiv)
  })
}

function closeCareDiv(careDiv) {
  careDiv.style.display = "none"
}

////// searching by name fields
const nameForm = document.getElementById("name-form")
const nameSelect = document.getElementById("plant-name")
////// the dropdowns:
const climateSelect = document.getElementById("climate-select")
const categorySelect = document.getElementById("category-select")

//////Searching by name:
nameForm.addEventListener("submit", function (event) {
  event.preventDefault()
  climateSelect.value = ""
  categorySelect.value = ""
  const nameValue = nameSelect.value.toUpperCase()
  if (nameSelect.value == "") {
    searchByName(nameValue, true)
  } else {
    searchByName(nameValue, false)
  }
})

function searchByName(nameValue, blankName) {
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
      }
      //////The following code is because the Common Name in the API pulls back either an Array or a String
    } else {
      if (
        //////if the Common Name has an array, then do this one.
        Array.isArray(commonName) &&
        commonName.some((name) => name.toUpperCase().includes(nameValue))
      ) {
        renderPlantInfo(plantData[i], "name")
      } else if (
        ///// else if the Common Name is a string, then do this one.
        typeof commonName === "string" &&
        commonName.toUpperCase().includes(nameValue)
      ) {
        renderPlantInfo(plantData[i], "name")
      }
    }
  }
}

/////Searching by climate:
climateSelect.addEventListener("change", function () {
  categorySelect.value = ""
  nameSelect.value = ""
  const selectedClimate = this.value
  if (selectedClimate !== "") {
    searchByClimate(selectedClimate)
  }
})

function searchByClimate(climateSelect) {
  plantSection.innerHTML = ""
  for (let i = 0; i < plantData.length; i++) {
    ////"Climat" is NOT misspelled here. This is how it is spelled in the API.
    if (plantData[i]["Climat"] === climateSelect) {
      renderPlantInfo(plantData[i], "climate")
    }
  }
}

//////searching by category:
categorySelect.addEventListener("change", function () {
  climateSelect.value = ""
  nameSelect.value = ""
  const selectedCategory = this.value
  if (selectedCategory !== "") {
    searchByCategory(selectedCategory)
  }
})

function searchByCategory(category) {
  plantSection.innerHTML = ""
  for (let i = 0; i < plantData.length; i++) {
    if (plantData[i]["Categories"] === category) {
      renderPlantInfo(plantData[i], "category")
    }
  }
}
