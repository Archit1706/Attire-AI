"use client";
import React, { useState, useEffect } from "react";
import { Link as LinkScroll } from "react-scroll";
import Modal from "react-modal";
import WebcamCapture from "../components/WebcamCapture";
import { AiOutlineClose } from "react-icons/ai";
import { motion } from "framer-motion";
import { fadeIn } from "../utils/fadein";
import { BsFillCameraFill, BsFillImageFill } from "react-icons/bs";

import { FileUploader } from "react-drag-drop-files";
import { useRouter } from "next/navigation";

export default function Home(props: any) {
    const router = useRouter();
    const fileTypes = ["JPG", "PNG", "JPEG"];
    const [modal1IsOpen, setIsOpen1] = useState(false);
    const [modal2IsOpen, setIsOpen2] = useState(false);
    const [fileImage, setFileImage] = useState(null);
    const [file, setFile] = useState(null);
    const [ngrok, setNgrok] = useState("");

    const openModal1 = () => {
        setIsOpen1(true);
    };

    const closeModal1 = () => {
        setIsOpen1(false);
    };

    const openModal2 = () => {
        setIsOpen2(true);
    };

    const closeModal2 = () => {
        setIsOpen2(false);
    };

    const handleFileUpload = (event: any) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                setFileImage(e.target.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };
    const handleChange = (file: any) => {
        setFile(file);
        var reader = new FileReader();
        let base64data;
        reader.onloadend = function () {
            base64data = reader.result;
            console.log(base64data);
            fetch(`${localStorage.getItem("ngrok")}/api/sdapi/resize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    image: base64data,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data.response[0]);
                    localStorage.setItem("image", data.response[0].toString());
                    router.push("/canvas");
                })
                .catch((err) => console.log(err));
        };
        reader.readAsDataURL(file);

        router.push("/canvas");
    };
    useEffect(() => {
        fetch("https://server.sidd065.repl.co/backend")
            .then((res) => res.json())
            .then((data) => {
                setNgrok(data.url);
                localStorage.setItem("ngrok", data.url);
                return;
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const generateImage = () => {
        fetch(`${localStorage.getItem("ngrok")}/api/sdapi/txt2img`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                gender: localStorage.getItem("gender"),
                prompt: "Plain White Shirt",
                keywords: "",
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                localStorage.setItem("image", data.response[0].toString());
                router.push("/canvas");
                return data.response;
            })
            .catch((err) => console.log(err));
    };

    return (
        <><title>Attire AI</title>
            <motion.section
                variants={fadeIn("up", 0.3)}
                initial="hidden"
                whileInView={"show"}
                viewport={{ once: false, amount: 0.4 }}
                className="grid h-screen md:h-[calc(100vh-80px)] place-items-center place-content-center gap-8"
            >
                {/* heading line */}
                <motion.div
                    variants={fadeIn("up", 0.4)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.4 }}
                    className="w-full text-center text-4xl md:text-[65px] leading-none font-[900] tracking-tighter"
                >
                    <h1 className="text-black md:text-[min(10vw, 100px)] ">
                        Empowering Your
                    </h1>{" "}
                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-500 via-yellow-500">
                        Unique Fashion Story
                    </h1>
                </motion.div>
                {/* buttons */}
                <motion.div
                    variants={fadeIn("up", 0.5)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.4 }}
                    className="flex flex-col md:flex-row justify-center items-center w-full gap-4  md:w-auto"
                >
                    <button
                        onClick={generateImage}
                        className="group border-none w-10/12 bg-white/60 shadow-gray-300 text-gray-700 p-2 h-[133px] rounded-md text-center flex justify-center items-center flex-col hover:shadow-md text-xl tracking-tight font-semibold hover:scale-105 transition-all duration-200 cursor-pointer"
                    >
                        <p className="group-hover:animate-bounce">
                            <BsFillImageFill className="h-6 w-6" />
                        </p>
                        {"Start with Generated Image"}
                        <h3 className="text-sm font-medium tracking-wide text-gray-500">
                            Instant Style Magic: Explore AI-Generated Outfits
                        </h3>
                    </button>
                    <LinkScroll
                        to="image-upload"
                        spy={true}
                        smooth={true}
                        className="group border-none w-10/12 bg-white/60 shadow-gray-300 text-gray-700 p-2 h-[133px] rounded-md text-center flex justify-center items-center flex-col hover:shadow-md text-xl tracking-tight font-semibold hover:scale-105 transition-all duration-200 cursor-pointer"
                        // onClick={openModal}
                    >
                        <p className="group-hover:animate-bounce">
                            <BsFillCameraFill className="h-6 w-6" />
                        </p>
                        {"Start with Your Own Image"}
                        <h3 className="text-sm font-medium tracking-wide text-gray-500">
                            Your Fashion, Your Way: Begin with Your Own
                            Inspiration
                        </h3>
                    </LinkScroll>
                </motion.div>
            </motion.section>

            {/* Two buttons one for image upload and one for capturing image through webcam the user can chose either of them to submit a photo */}
            <section
                id="image-upload"
                className="h-screen flex flex-col justify-center items-center w-full gap-4 text-center"
            >
                <motion.h1
                    variants={fadeIn("down", 0.3)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: false, amount: 0.4 }}
                    className="text-3xl font-bold text-black"
                >
                    Choose your pic to get started!
                </motion.h1>
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full">
                    <motion.button
                        variants={fadeIn("right", 0.3)}
                        initial="hidden"
                        whileInView={"show"}
                        viewport={{ once: false, amount: 0.4 }}
                        className="group border-none w-11/12 md:w-1/3 h-24 bg-white/60 shadow-gray-300 text-gray-700 p-2  rounded-md text-center flex justify-center items-center flex-col hover:shadow-md text-xl tracking-tight font-semibold hover:scale-105 transition-all duration-200 cursor-pointer"
                        onClick={openModal1}
                    >
                        <p className="group-hover:animate-bounce">
                            <BsFillImageFill className="h-6 w-6" />
                        </p>
                        Upload from your device
                    </motion.button>

                    <motion.button
                        variants={fadeIn("left", 0.3)}
                        initial="hidden"
                        whileInView={"show"}
                        viewport={{ once: false, amount: 0.4 }}
                        className="group border-none w-11/12 md:w-1/3 h-24 bg-white/60 shadow-gray-300 text-gray-700 p-2 rounded-md text-center flex justify-center items-center flex-col hover:shadow-md text-xl tracking-tight font-semibold hover:scale-105 transition-all duration-200 cursor-pointer"
                        onClick={openModal2}
                    >
                        <p className="group-hover:animate-bounce">
                            <BsFillCameraFill className="h-6 w-6" />
                        </p>
                        Capture from your webcam
                    </motion.button>
                </div>

                <Modal
                    ariaHideApp={false}
                    className="aspect-square w-screen md:h-[512px] md:w-[512px] md:mx-auto md:my-auto flex items-center justify-center"
                    isOpen={modal1IsOpen}
                    onRequestClose={closeModal1}
                    contentLabel="Upload or Capture an Image"
                >
                    <motion.div
                        variants={fadeIn("up", 0.3)}
                        initial="hidden"
                        whileInView={"show"}
                        viewport={{ once: false, amount: 0.4 }}
                        id="modal"
                        className="w-full rounded-md bg-gradient-to-r from-sky-500 via-yellow-300 to-orange-300 p-1 shadow-lg shadow-gray-400 h-40 flex justify-center items-center"
                    >
                        <div className=" relative flex flex-col h-full w-full bg-white/50 items-center justify-center">
                            <FileUploader
                                handleChange={handleChange}
                                name="file"
                                types={fileTypes}
                                label="Drag & Drop your files here"
                                multiple={false}
                                required={true}
                                className="h-full w-full border-2 border-gray-300 border-dashed rounded-md"
                            />
                            <div className="absolute top-2 right-2">
                                <button
                                    className="border-none w-10/12 bg-white/60 shadow-gray-300 text-gray-600 p-2 rounded-md text-center flex justify-center items-center flex-col hover:shadow-md text-xl tracking-tight font-semibold hover:scale-105 hover:text-black transition-all duration-200"
                                    onClick={closeModal1}
                                >
                                    <AiOutlineClose className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </Modal>
                <Modal
                    ariaHideApp={false}
                    className="relative aspect-square w-screen md:h-[512px] md:w-[512px] md:mx-auto md:my-auto "
                    isOpen={modal2IsOpen}
                    onRequestClose={closeModal2}
                    contentLabel="Capture an Image"
                >
                    <motion.div
                        variants={fadeIn("up", 0.4)}
                        initial="hidden"
                        whileInView={"show"}
                        viewport={{ once: false, amount: 0.4 }}
                        id="modal"
                        className="w-full rounded-md bg-gradient-to-r from-sky-500 via-yellow-300 to-orange-300 p-1 shadow-lg shadow-gray-400"
                    >
                        <div className="flex flex-col h-full w-full bg-white/50 items-center justify-center">
                            <WebcamCapture />
                            <div className="absolute top-2 right-2">
                                <button
                                    className="border-none w-10/12 bg-white/60 shadow-gray-300 text-gray-600 p-2 rounded-md text-center flex justify-center items-center flex-col hover:shadow-md text-xl tracking-tight font-semibold hover:scale-105 hover:text-black transition-all duration-200"
                                    onClick={closeModal2}
                                >
                                    <AiOutlineClose className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </Modal>
            </section>
        </>
    );
}
