import dynamic from "next/dynamic";

const WSPlayer = dynamic(() => import('@/app/components/Player'), { ssr: false });

export default function Player() {
    return (
        <div>
            <WSPlayer />
        </div>
    );
};
