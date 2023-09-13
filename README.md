# AttireAI - Empowering Your Unique Fashion Story

## Overview

This project combines cutting-edge AI technologies to provide users with a unique and interactive fashion experience. Users can interact with our solution through a canvas and chatbox, enabling them to add clothing items to images, get fashion recommendations, and even purchase generated clothing.

## Technologies Used

- **Frontend**:
  - Next.js: A React framework for building user interfaces.
  - Tailwind CSS: A utility-first CSS framework for styling the frontend.

- **Backend**:
  - Flask: A lightweight Python web framework for serving our AI models and handling user requests.

- **AI Models**:
  - Stable Diffusion: Used for inpainting, allowing users to add clothing items to images.
  - LLaMA: Our language model for fashion recommendations and internet searching.
  - WizardLM: Empowering our chatbox with conversational abilities.
  - ZoeDepth: Enhancing the depth perception of generated images.
  - ESRGAN_4x: Upscaling images from 512p to 2048p.
  - VGGNet: Powering our recommendation system based on user's past purchases.
  - LoRA: Custom-trained models for specific clothing items and larger-scale catalog training.

## Project Features

1. **Canvas Interaction**: Users can interact with the canvas to add clothing items to images using the Stable Diffusion model. They can mask an area of the image and name the item of clothing they want to add.

2. **Fashion Recommendations**: Users can chat with our LLaMA model to receive fashion recommendations. LLaMA has access to the internet to search for relevant articles based on user queries and uses VGGNet for personalized recommendations based on past purchases.

3. **Conversational Refinement**: Users can refine recommendations through conversation with LLaMA. For example, they can request recommendations for specific colors or styles.

4. **Image Upscaling**: If users are satisfied with the results, they can upscale the image from 512p to 2048p using ESRGAN_4x. This high-resolution image can then be sent to Google Lens for identifying and purchasing the generated clothing.

5. **LoRA Models**: We've also trained LoRA models for specific clothing items. This method can be used on a larger scale to train models based on an ecommerce website’s catalog of clothing.

## Setup and Installation

1. **Frontend**:
   - Navigate to the `frontend` directory.
   - Install dependencies: `npm install`.
   - Start the frontend server: `npm run dev`.

2. **Backend**:
   - Navigate to the `backend` directory.
   - Create a Python virtual environment (recommended).
   - Install Python dependencies: `pip install -r requirements.txt`.
   - Start the Flask server: `python app.py`.

3. **AI Models**:
   - Download and configure the AI models as needed. Refer to model-specific documentation for instructions.

## Usage

- Access the application through a web browser.
- Use the canvas to add clothing items to images, chat with LLaMA for fashion recommendations, and explore the various features of the project.

## Acknowledgments

- We would like to acknowledge the developers and researchers behind the AI models used in this project for their valuable contributions to the field of artificial intelligence.
- Special thanks to the open-source community for providing tools and frameworks that made this project possible.
