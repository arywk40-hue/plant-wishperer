"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, Code, BookOpen, Database, Zap } from "lucide-react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Model Training Guide</h1>
          <p className="text-gray-600">Learn how to train custom ML models with your crop health data</p>
        </div>

        {/* Quick Start */}
        <Card className="p-8 border-green-200 mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-green-600">1.</span>
              <span>Export your crop health data from Settings (CSV or JSON format)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-green-600">2.</span>
              <span>Download Kaggle datasets for additional training data</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-green-600">3.</span>
              <span>Prepare and preprocess your data using the provided scripts</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-green-600">4.</span>
              <span>Train your model using TensorFlow, PyTorch, or scikit-learn</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-green-600">5.</span>
              <span>Evaluate and deploy your custom model</span>
            </li>
          </ol>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="python" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-green-100">
            <TabsTrigger value="python" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Python Guide
            </TabsTrigger>
            <TabsTrigger value="kaggle" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Kaggle Datasets
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Python Guide */}
          <TabsContent value="python" className="space-y-6">
            <Card className="p-6 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-green-600" />
                Python Setup & Data Preparation
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Install Required Libraries</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    {`pip install pandas numpy scikit-learn tensorflow opencv-python matplotlib`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2. Load and Prepare Data</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    {`import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Load exported data
data = pd.read_csv('crop-health-data.csv')

# Prepare features and labels
X = data[['vision_risk', 'audio_risk', 'sensor_risk']]
y = data['health_score']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3. Train a Model (Random Forest)</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    {`from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f'MSE: {mse:.4f}')
print(f'R² Score: {r2:.4f}')`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">4. Deep Learning with TensorFlow</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    {`import tensorflow as tf
from tensorflow import keras

# Build model
model = keras.Sequential([
    keras.layers.Dense(64, activation='relu', input_shape=(3,)),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(32, activation='relu'),
    keras.layers.Dense(1)
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# Train
history = model.fit(
    X_train_scaled, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2
)

# Evaluate
loss, mae = model.evaluate(X_test_scaled, y_test)
print(f'Test MAE: {mae:.4f}')`}
                  </pre>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Image Classification with CNN</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                {`import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Load and preprocess images
train_datagen = ImageDataGenerator(rescale=1./255, rotation_range=20)
train_generator = train_datagen.flow_from_directory(
    'path/to/crop/images',
    target_size=(224, 224),
    batch_size=32
)

# Build CNN model
model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(224,224,3)),
    tf.keras.layers.MaxPooling2D((2,2)),
    tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2,2)),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.fit(train_generator, epochs=10)`}
              </pre>
            </Card>
          </TabsContent>

          {/* Kaggle Datasets */}
          <TabsContent value="kaggle" className="space-y-6">
            <Card className="p-6 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Recommended Kaggle Datasets
              </h3>

              <div className="space-y-4">
                {[
                  {
                    name: "Plant Disease Detection",
                    url: "kaggle.com/datasets/vipoooool/new-plant-diseases-dataset",
                    desc: "38,000+ images of healthy and diseased crop leaves",
                  },
                  {
                    name: "Crop Yield Prediction",
                    url: "kaggle.com/datasets/paultimothymooney/crop-yield-prediction",
                    desc: "Historical crop yield data with weather and soil information",
                  },
                  {
                    name: "Agricultural Soil Data",
                    url: "kaggle.com/datasets/ashwinkumar12345/soil-data-classification",
                    desc: "Soil properties and classification data",
                  },
                  {
                    name: "Plant Seedlings Classification",
                    url: "kaggle.com/datasets/vbookshelf/plant-seedlings-classification",
                    desc: "12 plant species seedling images for classification",
                  },
                ].map((dataset, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-200 transition"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">{dataset.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{dataset.desc}</p>
                    <a
                      href={`https://${dataset.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View on Kaggle →
                    </a>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Download Kaggle Data</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mb-4">
                {`# Install Kaggle CLI
pip install kaggle

# Set up API credentials
# Download from https://www.kaggle.com/settings/account
# Place kaggle.json in ~/.kaggle/

# Download dataset
kaggle datasets download -d vipoooool/new-plant-diseases-dataset
unzip new-plant-diseases-dataset.zip`}
              </pre>
            </Card>
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources" className="space-y-6">
            <Card className="p-6 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                Learning Resources
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">TensorFlow & Keras</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <a href="https://www.tensorflow.org/tutorials" className="text-green-600 hover:text-green-700">
                        Official TensorFlow Tutorials
                      </a>
                    </li>
                    <li>
                      <a href="https://keras.io/guides/" className="text-green-600 hover:text-green-700">
                        Keras Documentation & Guides
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Scikit-Learn</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <a
                        href="https://scikit-learn.org/stable/documentation.html"
                        className="text-green-600 hover:text-green-700"
                      >
                        Scikit-Learn Documentation
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://scikit-learn.org/stable/modules/ensemble.html"
                        className="text-green-600 hover:text-green-700"
                      >
                        Ensemble Methods Guide
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Computer Vision</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <a href="https://opencv.org/courses/" className="text-green-600 hover:text-green-700">
                        OpenCV Courses
                      </a>
                    </li>
                    <li>
                      <a href="https://www.fast.ai/" className="text-green-600 hover:text-green-700">
                        Fast.ai Deep Learning Course
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Agriculture & ML</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <a
                        href="https://www.coursera.org/learn/machine-learning"
                        className="text-green-600 hover:text-green-700"
                      >
                        Machine Learning Specialization
                      </a>
                    </li>
                    <li>
                      <a href="https://www.kaggle.com/learn" className="text-green-600 hover:text-green-700">
                        Kaggle Learn Courses
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Best Practices
              </h3>

              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Always split data into training (70%), validation (15%), and test (15%) sets</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Normalize/standardize features before training</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Use cross-validation for more robust model evaluation</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Monitor for overfitting using validation metrics</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Document your model architecture and hyperparameters</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Test your model on real-world data before deployment</span>
                </li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Download Resources */}
        <Card className="p-6 border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Download Resources</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 justify-center py-6">
              <Download className="w-5 h-5" />
              Download Python Starter Kit
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 justify-center py-6">
              <Download className="w-5 h-5" />
              Download Jupyter Notebooks
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
