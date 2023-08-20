import numpy as np
import pandas as pd
import json
import tensorflow.keras as keras
from tensorflow.keras.applications import VGG16
import keras.utils as image
from keras.applications.densenet import preprocess_input
from keras.layers import GlobalMaxPooling2D
from sklearn.metrics.pairwise import linear_kernel


class fashion_recommendations:
    def __init__(self, img_path, styles_path):
        self.img_path = img_path
        self.df_embeddings = pd.read_pickle("./assets/embeddings.pkl")
        self.styles_path = styles_path

    def get_styles_df(self):
        styles_df = pd.read_csv(self.styles_path, nrows=6000)
        styles_df["image"] = styles_df.apply(lambda x: str(x["id"]) + ".jpg", axis=1)
        return styles_df

    def load_model(self):
        vgg16 = VGG16(include_top=False, weights="imagenet", input_shape=(100, 100, 3))
        vgg16.trainable = False
        vgg16_model = keras.Sequential([vgg16, GlobalMaxPooling2D()])
        return vgg16_model

    def predict(self, model, img_path):
        img = image.load_img(self.img_path, target_size=(100, 100))
        img = image.img_to_array(img)
        img = np.expand_dims(img, axis=0)
        img = preprocess_input(img)
        return model.predict(img)

    def get_similarity(self):
        model = self.load_model()
        df_embeddings = self.df_embeddings
        sample_image = self.predict(model, self.img_path)
        df_sample_image = pd.DataFrame(sample_image)
        sample_similarity = linear_kernel(df_sample_image, df_embeddings)
        return sample_similarity

    def normalize_sim(self):
        similarity = self.get_similarity()
        x_min = similarity.min(axis=1)
        x_max = similarity.max(axis=1)
        norm = (similarity - x_min) / (x_max - x_min)[:, np.newaxis]
        return norm

    def get_recommendations(self):
        similarity = self.normalize_sim()
        df = self.get_styles_df()
        sim_scores = list(enumerate(similarity[0]))

        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:3]
        cloth_indices = [i[0] for i in sim_scores]

        images = df["image"].iloc[cloth_indices]
        product_names = df["productDisplayName"].iloc[cloth_indices]

        result_dict = {product: image for product, image in zip(product_names, images)}
        result_json = json.dumps(result_dict)

        return result_json
