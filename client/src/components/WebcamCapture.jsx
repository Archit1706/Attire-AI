"use client";
import Webcam from "react-webcam";
import React, { useState, useCallback, useRef } from "react";
import { AiFillCamera } from "react-icons/ai";
import { useRouter } from "next/navigation";

const videoConstraints = {
    width: 512,
    height: 512,
    facingMode: "user",
};

const WebcamCapture = () => {
    const router = useRouter();
    const [ngrok, setNgrok] = useState("");
    const webcamRef = useRef(null);
    const capture = useCallback(
        (e) => {
            const imageSrc = webcamRef.current.getScreenshot();
            // setImage(imageSrc);
            console.table(imageSrc);
            // localStorage.setItem("image", imageSrc);
            // const data = fetch(`${ngrok}/api/sdapi/resize`, {
            const data = fetch(
                `${localStorage.getItem("ngrok")}/api/sdapi/resize`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        image: imageSrc,
                    }),
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    console.log(data.response[0]);
                    localStorage.setItem("image", data.response[0].toString());
                    router.push("/canvas");
                })
                .catch((err) => console.log(err));
        },
        [webcamRef]
    );

    // useEffect(() => {
    //     fetch("https://server.sidd065.repl.co/backend")
    //         .then((res) => res.json())
    //         .then((data) => {
    //             console.log(data);
    //             setNgrok(data.url);
    //             localStorage.setItem("ngrok", data.url);
    //             return;
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         });
    // });

    return (
        <>
            <Webcam
                audio={false}
                height={720}
                ref={webcamRef}
                screenshotFormat="image/png"
                width={1280}
                videoConstraints={videoConstraints}
            />
            <div className="flex justify-around items-center flex-row text-center my-2">
                <button
                    className="group border-none w-fit bg-white/90 shadow-gray-300 text-gray-600 p-2 rounded-md text-center flex justify-center items-center flex-col hover:shadow-md text-xl tracking-tight font-semibold hover:scale-105 hover:text-black transition-all duration-200"
                    onClick={capture}
                >
                    <p className="flex justify-center items-center text-center flex-row gap-2">
                        <AiFillCamera className="font-bold group-hover:animate-pulse h-6 w-6" />
                        <span>Capture</span>
                    </p>
                </button>
            </div>
        </>
    );
};

export default WebcamCapture;
