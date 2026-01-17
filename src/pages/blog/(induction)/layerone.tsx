"use client"

type EmbeddingProps = {
    sequence: string;
};

const LayerOne = ({ sequence }: EmbeddingProps) => {
    if (!sequence) {
        return null;
    }
    const splitSequence = sequence.split(" ");
    return (
        <div className="flex items-center justify-center space-x-3 border-2 p-3">
            {splitSequence.map((value, idx) => {
                return <Token token={value} position={idx} sequence={splitSequence} />
            })}
        </div>
    );
};

type TokenProps = {
    token: string;
    position: number;
    sequence: string[];
};

const Token = ({ token, position, sequence }: TokenProps) => {
    return (
        <div className="flex flex-col border-2 p-1 items-center min-w-10">
            <div>{token}</div>
            <div>{token === "..." ? "..." : position}</div>
            {token !== "..." && <div className="text-sm text-center">I follow {position === 0 ? "BOS" : sequence[position-1]}</div>}
        </div>
    );
};

export default LayerOne;