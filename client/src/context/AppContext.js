"use client";
import React, { useState, useEffect, createContext } from "react";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [image, setImage] = useState("");


    useEffect(() => {
        console.log(new Date().getDate(), image);
    }, [image])

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <AppContext.Provider
            value={{
                image,
                setImage,
                getBase64,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;
