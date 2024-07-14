# Install required packages
!pip install datasets
!pip install fasttext
!pip install numpy
!pip install pandas
!pip install scipy
!pip install tensorflow
# Import relevant modules
from datasets import load_dataset
import re
from datasets import DatasetDict
import os
import fasttext
import numpy as np
import pandas
import scipy
import math
import csv
import tensorflow as tf
from scipy.spatial.distance import cosine
from scipy.stats import pearsonr
# Load the dataset
df = load_dataset("wikipedia", "20220301.en", trust_remote_code=True)
# Preprocess the text
def preprocess(text):
    text = re.sub(r'[^\w\s]+', ' ', text)
    text = re.sub(r'[ \n]+', ' ', text)
    return text.strip().lower()
train_dataset = df['train']

# Create the file path to store the preprocessed text
preprocessed_text_file = 'pt10000.txt'

# Set the counter as per the text file
counter = 1

# Open the file for writing
with open(preprocessed_text_file, 'w', encoding='utf-8') as f:
    # Iterate over the train dataset
    for data_point in train_dataset:
        text = data_point['text']

        # Perform any preprocessing steps on the text
        preprocessed_text = preprocess(text)

        # Write the preprocessed text to the file
        f.write(preprocessed_text + '\n')
        print("Progress: ", data_point['title'], counter)
        if(counter == 10000):
            break
        counter += 1
# Train the model (CBOW 100 dimensions)
model = fasttext.train_unsupervised("pt10000.txt", model='cbow', dim = 100)
# Save the model
model.save_model("model10000.bin")
# Load the model
model10000 = fasttext.load_model("model10000.bin")
# Get the word vector for a word
word1 = 'king'
word2 = 'man'
word3  = 'woman'

vectorOne1 = model10000.get_word_vector(word1)
vectorTwo1 = model10000.get_word_vector(word2)
vectorThree1 = model10000.get_word_vector(word3)

# Calculate the cosine similarity between two words
similarityOne1 = np.dot(vectorOne1, vectorTwo1) / (np.linalg.norm(vectorOne1) * np.linalg.norm(vectorTwo1))
similarityTwo1 = np.dot(vectorOne1, vectorThree1) / (np.linalg.norm(vectorOne1) * np.linalg.norm(vectorThree1))

# Print the cosine similarity
print(f'The cosine similarity between "{word1}" and "{word2}" using model1 is {similarityOne1:.2f}')
print(f'The cosine similarity between "{word1}" and "{word3}" using model1 is {similarityTwo1:.2f}')
# Load the STS Benchmark dataset
sts_dataset = tf.keras.utils.get_file(
    fname="Stsbenchmark.tar.gz",
    origin="http://ixa2.si.ehu.es/stswiki/images/4/48/Stsbenchmark.tar.gz",
    extract=True)

sts_dev = pandas.read_table(
    os.path.join(os.path.dirname(sts_dataset), "stsbenchmark", "sts-dev.csv"),
    skip_blank_lines=True,
    usecols=[4, 5, 6],
    names=["sim", "sent_1", "sent_2"])

sts_test = pandas.read_table(
    os.path.join(
        os.path.dirname(sts_dataset), "stsbenchmark", "sts-test.csv"),
    quoting=csv.QUOTE_NONE,
    skip_blank_lines=True,
    usecols=[4, 5, 6],
    names=["sim", "sent_1", "sent_2"])

# Cleanup some NaN values in sts_dev
sts_dev = sts_dev[[isinstance(s, str) for s in sts_dev['sent_2']]]
sts_test = sts_test[[isinstance(s, str) for s in sts_test['sent_2']]]

# Preprocess a sentence by converting it to lowercase and splitting into words
def preprocess_sentence(sentence):
  return sentence.lower().split()

# Calculate the sentence embedding using average word embeddings
def get_sentence_embedding(model, sentence):
  return model.get_sentence_vector(sentence)

# Evaluate the FastText model on the STS Benchmark data
def run_sts_benchmark(model, sts_data):
  scores = []
  for sent1, sent2, label in zip(sts_data["sent_1"], sts_data["sent_2"], sts_data["sim"]):
    # Preprocess sentences
    preprocessed_sent1 = preprocess_sentence(sent1)
    preprocessed_sent2 = preprocess_sentence(sent2)

    # Get sentence embeddings one at a time
    sentence1_embedding = get_sentence_embedding(model, " ".join(preprocessed_sent1))
    sentence2_embedding = get_sentence_embedding(model, " ".join(preprocessed_sent2))

    # Calculate cosine similarity
    cosine_similarity = 1 - cosine(sentence1_embedding, sentence2_embedding)  # Higher value means more similar

    scores.append(cosine_similarity)
  return scores



# Load STS Benchmark data
sts_data = sts_test

# Run STS Benchmark evaluation
scores = run_sts_benchmark(model10000, sts_data)

# Calculate Pearson correlation coefficient
pearson_correlation, pValue = pearsonr(scores, sts_data["sim"])

# Print the results
print('Pearson correlation coefficient = {0}\np-value = {1}'.format(pearson_correlation, pValue))
