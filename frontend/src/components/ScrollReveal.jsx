import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const ScrollReveal = ({ children }) => {
    const { ref, inView } = useInView({
        triggerOnce: true, // Chỉ chạy hiệu ứng 1 lần khi cuộn tới
        threshold: 0.1,    // Hiện ra khi 10% component nằm trong màn hình
    });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }} // Trạng thái ban đầu: mờ và nằm dưới 50px
            animate={inView ? { opacity: 1, y: 0 } : {}} // Khi cuộn tới: hiện lên và trượt về vị trí cũ
            transition={{ duration: 0.6, ease: "easeOut" }} // Tốc độ mượt
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;