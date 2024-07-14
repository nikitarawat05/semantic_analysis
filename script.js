const form = document.getElementById('similarity-form');
const skipgramButton = document.getElementById('skipgram');
const cbowButton = document.getElementById('cbow');
const similarityValues = []; // Array to store similarity values
let chartInstance = null; // Initializes a variable to store the chart instance.
var selectedButton = "skipgram";


//Function to Send skipgram Similarity Request
async function sendSkipGramSimilarityRequest(sentence1, sentence2, model) {
  const url = '/skipgram-similarity100';        //Sets the URL for the skip-gram similarity request.
  try {
    const response = await fetch(url, { // Sends a POST request to the specified URL.
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({        //Constructs the request body using URLSearchParams.
          sentence1: sentence1,
          sentence2: sentence2,
          model: model,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);        //Checks if the response is not OK and throws an error if true.
    }

    const responseData = await response.json();   //Parses the response data as JSON.
    if (responseData.error) {
      throw new Error(responseData.error);
    }

    similarity = responseData.similarity;          //Extracts the similarity value from the response data.
    console.log('Similarity:', similarity);

    similarityValues.push(similarity);            //Adds the similarity value to the similarityValues array.

  } catch (error) {
    console.error('Error:', error.message);
  }
}


//Function to Send CBOW Similarity Request
async function sendCbowSimilarityRequest(sentence1, sentence2, model) {
  const url = '/cbow-similarity100';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
          sentence1: sentence1,
          sentence2: sentence2,
          model: model,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const responseData = await response.json();
    if (responseData.error) {
      throw new Error(responseData.error);
    }

    similarity = responseData.similarity;
    console.log('Similarity:', similarity);

    similarityValues.push(similarity);

  } catch (error) {
    console.error('Error:', error.message);
  }
}



function sendRequestWithDelay(sentence1, sentence2, versions) {
  versions.forEach((version, index) => {     //Iterates over the versions array.
    setTimeout(() => {
      if(selectedButton == "skipgram"){
        sendSkipGramSimilarityRequest(sentence1, sentence2, version);
      }
      else{
        sendCbowSimilarityRequest(sentence1, sentence2, version);
      }
    }, index * 200);
  });
}


//Form Submission Event Listener
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const sentence1 = document.getElementById('sentence1').value;            //gets first sentence
    const sentence2 = document.getElementById('sentence2').value;

    similarityValues.length = 0; // Clear the array

    sendRequestWithDelay(sentence1, sentence2, ['1', '2', '3', '4', '5']);


    // Create or update the chart after all similarity values are fetched
    setTimeout(() => {
      createOrUpdateChart();
    }, 1000);
});



function createOrUpdateChart() {
  const chartContainer = document.getElementById('chart-container');
  chartContainer.innerHTML = ''; // Clear the container

  if (chartInstance) {
      chartInstance.destroy(); // Destroy the existing chart instance
  }

  const chartData = {
      labels: ['sg 1', 'sg 2', 'sg 3', 'sg 4', 'sg 5'],
      datasets: [
          {
              label: 'Cosine Similarity',
              data: similarityValues,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              borderRadius: 5,
          },
      ],
  };

  const chartConfig = {
      type: 'bar',
      data: chartData,
      options: {
          scales: {
              y: {
                  beginAtZero: true,
                  max: 1,
              },
          },
      },
  };

  const chartCanvas = document.createElement('canvas');   //Creates a new canvas element.
  chartContainer.appendChild(chartCanvas);

  chartInstance = new Chart(chartCanvas, chartConfig);
}


//Functions to Handle Button Selection
function selectSkipGram(){
  skipgramButton.style.backgroundColor = "white";
  cbowButton.style.backgroundColor = "#ffffff32";
  selectedButton = "skipgram";
  const sentence1 = document.getElementById('sentence1').value;
  const sentence2 = document.getElementById('sentence2').value;
  similarityValues.length = 0; // Clear the array
  sendRequestWithDelay(sentence1, sentence2, ['1', '2', '3', '4', '5']);
  // Create or update the chart after all similarity values are fetched
  setTimeout(() => {
    createOrUpdateChart();
  }, 1000);
}

function selectCBOW(){
  cbowButton.style.backgroundColor = "white";
  skipgramButton.style.backgroundColor = "#ffffff32";
  selectedButton = "cbow";
  const sentence1 = document.getElementById('sentence1').value;
  const sentence2 = document.getElementById('sentence2').value;
  similarityValues.length = 0; // Clear the array
  sendRequestWithDelay(sentence1, sentence2, ['1', '2', '3', '4', '5']);
  // Create or update the chart after all similarity values are fetched
  setTimeout(() => {
    createOrUpdateChart();
  }, 1000);
}