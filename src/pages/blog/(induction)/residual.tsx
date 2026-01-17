import { useState } from "react";

const Residual = () => {
    const [selectedToken, setSelectedToken] = useState(0);

    return (
        <div className="flex flex-col p-3">
            <div className="flex justify-start space-x-3">
                <select className="border-2 border-b-0" onChange={(e) => {
                    setSelectedToken(Number(e.target.value));
                }}>
                    {tokens[0].map((_, idx) => {
                        return <option key={idx} value={idx}>{idx}</option>
                    })}
                </select>
                <Highlight text={"Steve Smith is the chief visionary behind Gig. Steve Smith is"} tokenIdx={selectedToken}/>
            </div>
            <div className="flex flex-wrap border-2 space-x-2 text-xs lg:text-base">
                {tokens.map((token, idx) => {
                    return <div className="flex items-center space-x-2">
                        <Layer key={idx} tokens={token} tokenIdx={selectedToken} />
                        {idx + 1 !== tokens.length && <span>-&gt;</span>}
                    </div>
                })}
            </div>
        </div>
    );
};

type LayerProps = {
    tokens: string[];
    tokenIdx: number;
}

const Layer = ({ tokens, tokenIdx }: LayerProps) => {
    const token = tokens[tokenIdx];
    return (
        <div>
            {token === "\n" ? "newline" : token}
        </div>
    )
};

type HighlightProps = {
    text: string;
    tokenIdx: number;
}

const Highlight = ({text, tokenIdx}: HighlightProps) => {
    const lexTokens = text.split(/[\s]+|([.,])/).filter(Boolean); 

    return(
        <span>
            {lexTokens.map((token, idx) => {
                return (
                    <span style={{fontWeight: tokenIdx === idx ? "bold" : "normal"}} key={idx}>{token} </span>
                );
            })}
        </span>
    );
}

const tokens = [[
'Steve',
' Smith',
' is',
' the',
' chief',
' visionary',
' behind',
' Gig',
'.',
' Steve',
' Smith',
' is'],
[
' Steve',
'sonian',
' not',
' same',
' chief',
' visionary',
' behind',
' Gig',
' It',
' Steve',
'sonian',
' now'],
[
' Martin',
'sonian',
' now',
' same',
' chief',
' visionary',
' behind',
'abyte',
' It',
' Rogers',
'sonian',
' now'],
[
' Martin',
'sonian',
' now',
' same',
' chief',
' vision',
' behind',
'abyte',
' But',
' Jobs',
'sonian',
' now'],
[
' Martin',
'sonian',
' now',
' same',
' executive',
' leader',
' behind',
'abyte',
' But',
' Jobs',
'sonian',
' also'],
[
' Martin',
'son',
' now',
' latest',
' executive',
' leader',
' behind',
'abyte',
'com',
' Rogers',
'son',
' also'],
[
' Jobs',
'son',
' now',
' latest',
' executive',
' behind',
' crafting',
'abyte',
'org',
' Rogers',
' III',
' also'],
[
' Rogers',
'son',
' proud',
' latest',
' executive',
' behind',
' the',
'abyte',
'org',
' Rogers',
' III',
' also'],
[
' Jobs',
' III',
' proud',
' editor',
' executive',
' behind',
' the',
'abyte',
'org',
' Smith',
' III',
' also'],
[
' Jobs',
' III',
' suing',
' author',
' executive',
' architect',
' the',
'abyte',
'com',
' Smith',
' is',
' the'],
[
' Jobs',
' III',
' suing',
' founder',
' executive',
' behind',
' the',
'abyte',
'net',
' Smith',
' is',
' the'],
[
' Jobs',
' Sr',
' suing',
' founder',
' executive',
' architect',
' Tesla',
'abit',
'net',
' Smith',
' is',
' the']];

export default Residual;