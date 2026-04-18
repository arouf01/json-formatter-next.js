import { motion } from "framer-motion";

export function DotLoader() {
  const dotVariants = {
    animate: (i: number) => ({
      y: [0, -12, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.2,
      },
    }),
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={dotVariants}
          animate="animate"
          className="h-3 w-3 rounded-full bg-secondary"
        />
      ))}
    </div>
  );
}
