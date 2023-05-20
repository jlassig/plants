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

  if (storedData) {
    const parsedData = JSON.parse(storedData)
    // console.log(parsedData)
    return parsedData
  } else {
    // Fetch the data from the API if not available in local storage
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
  }
  else if(searchType === "category"){
    let category = document.createElement("p")
    category.setAttribute("class", "category")
    category.innerHTML=`Category: <br>${data["Categories"]}`
    plantDiv.appendChild(category)
  }

  /////putting it all in the plant Section
  plantSection.appendChild(plantDiv)
}
const nameForm = document.getElementById("name-form")
const nameSelect = document.getElementById("plant-name")
const nameSubmitBtn = document.getElementById("name-submit")

//////Searching by name:
// document.addEventListener("DOMContentLoaded", function (event) {
//   event.preventDefault()

nameForm.addEventListener("submit", function (event) {
  event.preventDefault()
  const nameValue = nameSelect.value

  searchByName(nameValue)
})

function searchByName(nameValue) {
  plantSection.innerHTML = ""
  for (let i = 0; i < plantData.length; i++) {
    const commonName = plantData[i]["Common name"]

    if (Array.isArray(commonName) && commonName.includes(nameValue)) {
      renderPlantInfo(plantData[i], "name")
    } else if (typeof commonName === "string") {
      renderPlantInfo(plantData[i], "name")
    }
  }
}
// })
/////Searching by climate:
const climateSelect = document.getElementById("climate-select")
climateSelect.addEventListener("change", function () {
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
const categorySelect = document.getElementById("category-select")

categorySelect.addEventListener("change", function () {
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

// async function getPlantData() {
//   try {
//     const response = await fetch(url, options)
//     const result = await response.json()
//     console.log(result)
//     localStorage.setItem("plantData", JSON.stringify(result))
//     // renderPlantInfo(result)
//     return result
//   } catch (error) {
//     console.error(error)
//   }
// }

// function renderPlantInfo(data) {
//   // for (let i = 0; i < data.length; i++) {
//     ////create elements
//     let plantDiv = document.createElement("div")
//     let commonName = document.createElement("h4")
//     let latinName = document.createElement("h5")
//     let plantImage = document.createElement("img")
//     ////set attributes for styling
//     plantDiv.setAttribute("class", "plant-div")
//     commonName.setAttribute("class", "common-name")
//     latinName.setAttribute("class", "latin-name")
//     plantImage.setAttribute("class", "plant-image")
//     plantImage.setAttribute("src", data[i]["Img"])
//     plantImage.setAttribute("loading", "lazy")
//     plantImage.setAttribute("width", "150")
//     plantImage.setAttribute("height", "150")

//     ////formatting the commonName (because sometimes it's an array that smooshes several plant names together only seperated by a comma with no space)
//     let commonNameValue = data[i]["Common name"]
//     let formattedCommonName = ""
//     if (Array.isArray(commonNameValue)) {
//       formattedCommonName = commonNameValue
//         .map((name) => name.trim())
//         .join("<br>")
//     } else if (typeof commonNameValue === "string") {
//       formattedCommonName = commonNameValue
//     }

//     ////fill up the HTML
//     // commonName.innerHTML = `Common name: <br>${data[i]["Common name"]}`
//     commonName.innerHTML = `Common name: <br>${formattedCommonName}`
//     latinName.innerHTML = `Latin name: <br>${data[i]["Latin name"]}`

//     ////append the things
//     plantDiv.appendChild(plantImage)
//     plantDiv.appendChild(commonName)
//     plantDiv.appendChild(latinName)

//     plantSection.appendChild(plantDiv)
//   }
// // }

// // Check if the data exists in local storage
// const storedData = localStorage.getItem("plantData")

// if (storedData) {
//   const parsedData = JSON.parse(storedData)
//   renderPlantInfo(parsedData)
// } else {
//   // Fetch the data from the API if not available in local storage
//   getPlantData()
// }
