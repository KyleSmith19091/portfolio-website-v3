"use client"

type EmbeddingProps = {
    sequence: string;
};

const Embedding = ({ sequence }: EmbeddingProps) => {
    if (!sequence) {
        return null;
    }
    return (
        <div className="flex items-center justify-center space-x-3 border-2 p-3">
            {sequence.split(" ").map((value, idx) => {
                return <Token token={value} position={idx} />
            })}
        </div>
    );
};

type TokenProps = {
    token: string;
    position: number;
};

const Token = ({ token, position }: TokenProps) => {
    return (
        <div className="flex flex-col border-2 p-1 items-center min-w-10">
            <div>{token}</div>
            <div>{position}</div>
        </div>
    );
};

export default Embedding;