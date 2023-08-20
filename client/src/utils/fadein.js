export const fadeIn = (direction, delay) => {
    return {
        hidden: {
            y: direction === 'up' ? 80 : direction === 'down' ? -80 : 0,
            opacity: 0,
            x: direction === 'left' ? 80 : direction === 'right' ? -80 : 0,
        },
        show: {
            y: 0,
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                duration: 1.2,
                delay: delay,
                ease: [0.25, 0.25, 0.25, 0.75],
            },
        },
    };
};

{/* <motion.h1
    variants={fadeIn('up', 0.3)}
    initial="hidden"
    whileInView={'show'}
    viewport={{ once: false, amount: 0.7 }}
    className='text-[50px] uppercase font-bold leading-[0.8] lg:text-[80px]'>
    <span className='text-accent'>{prefix}</span>{" "}
    <span>{firstname}</span>
    {" "}
    <span>
        {lastname}
    </span>
</motion.h1> */}