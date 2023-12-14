const crypto = require('crypto');
const sha3 = require('js-sha3');
const { parse } = require('path');

class TableGenerator {
    printSeparatorLine(lengthOfString){
        console.log(''.padEnd(lengthOfString, '-'));
    }
    
    printHelpTable(possMoves, wnl){
        let fisrtColumnLongestStringLength = 'v PC\\User >'.length;
        for(let i = 0; i < 3; i++){
            if(possMoves[i].length > fisrtColumnLongestStringLength){
                fisrtColumnLongestStringLength=possMoves[i].length;
            }
        }
        let headerLength = 0;
    
        for(let i = 0; i < possibleMoves.length; i++){ ////// MUST CHANGE
                let temp='';
                if(i === 0){
                    temp+='v PC\\User >'.padEnd(fisrtColumnLongestStringLength + 1, ' ') + '| ';
                    let longestOtherFirst = 4;
                    for(let j = 0; j < possibleMoves.length; j++){
                        if(j < 2){
                            if(possMoves[j].length > longestOtherFirst){
                                temp+=possMoves[j].padEnd(possMoves[j].length+1) + '| ';
                            } else{
                                temp+=possMoves[j].padEnd(longestOtherFirst + 1) + '| ';
                            }
                        } else{
                            if( j!==2){
                                temp+=j+1 + 'th'.padEnd(4) + '| ';
                            } else{
                                temp+=j+1 + 'rd move ' + '| ';
                            }
                        }
                    }
                    console.log(temp);
                    headerLength = temp.length - 1;
                    this.printSeparatorLine(headerLength);
                    temp='';
                }
                if(i < 2){
                    temp+=possMoves[i].padEnd(fisrtColumnLongestStringLength + 1) + '| ';
                } else if(i === 2){
                    temp+='3rd move'.padEnd(fisrtColumnLongestStringLength + 1) + '| ';
                } else temp+=(i+1 + 'th').padEnd(fisrtColumnLongestStringLength + 1) + '| ';
                for(let j = 0; j < possibleMoves.length; j++){
                    let longestOther = 4;
                    if( j===2){
                        longestOther = '3rd move'.length;
                    } 
                    else if(possMoves[j].length > 4 && j < 2){          
                        longestOther = possMoves[j].length;
                    }
                    
                    if(((j+1) + 'th').length >= 4){
                       longestOther = (parseInt(j+1) + 'th').length + 1;
                    }

                    let result = wnl.getWinnerOrLooser(possMoves, j, i);
                    if(result === 'draw'){
                        temp+='Draw'.padEnd(longestOther + 1) + '| ';
                    } else if(result === 'win'){
                        temp+='Win'.padEnd(longestOther + 1) + '| ';
                    } else if(result === 'lose'){
                        temp+='Lose'.padEnd(longestOther + 1) + '| ';
                    }
                }
                console.log(temp);
                this.printSeparatorLine(headerLength);
            }
    }
}

class WinnersAndLosers{
    getLosingMoves(possMoves, move){
        let losingMoves = [];
        for(let i = move + 1; i <= move + Math.floor(possMoves.length/2); i++){
            if(i >= possMoves.length){
                losingMoves.push(0 + (i - possMoves.length));
            } 
            else{
                losingMoves.push(i);
            }
        }
        return losingMoves;
    }

    getWinnerOrLooser(possMoves, moveOne, moveTwo){
        let losesTo = this.getLosingMoves(possMoves, moveOne);
        if(moveOne === moveTwo){
            return 'draw';
        } else if(losesTo.includes(moveTwo)){
            return 'lose';
        } else{
            return 'win';
        }
    }
    
}

class HMACandKey{
    generateHMACKey() {
    const keyLength = 32; // 256 bits
    const keyBuffer = crypto.randomBytes(keyLength);
    return keyBuffer.toString('hex').toUpperCase();
    }

    calculateHmacSha3(password, key) {
        const keyBuffer = Buffer.from(key, 'hex');
        const passwordBuffer = Buffer.from(password, 'utf-8');
        const sha3Password = sha3.sha3_256.create();
        sha3Password.update(passwordBuffer);
        const hashedPassword = sha3Password.hex();
        const hmac = crypto.createHmac('sha256', keyBuffer);
        hmac.update(Buffer.from(hashedPassword, 'hex'));
        const hmacResult = hmac.digest('hex').toUpperCase();
        return hmacResult;
    }
}

function checkIfHasDupes(arr) {
    return (new Set(arr)).size !== arr.length;
}

function getRandomMove(array) {
    return Math.floor(Math.random() * (array.length));
}
  
const possibleMoves = process.argv.slice(2);
const readline = require("readline-sync"); 

const hac = new HMACandKey;
const hmacKey = hac.generateHMACKey();
///
if(possibleMoves.length >= 3 && possibleMoves.length % 2 !== 0 && !(checkIfHasDupes(possibleMoves))){
    const wnl = new WinnersAndLosers;
    const computerMove = getRandomMove(possibleMoves);
    const result = hac.calculateHmacSha3(possibleMoves[computerMove], hmacKey);
    console.log('HMAC: ');
    console.log(result);

    main(computerMove, possibleMoves, wnl);

} else {
    if(possibleMoves.length < 3){
        console.log('You must have entered more than 3 arguments!');
    }
    if(possibleMoves.length % 2 === 0){
        console.log('Total number of arguments must be odd!');
    }
    if(checkIfHasDupes(possibleMoves)){
        console.log('Arguments must not repeat!');
    }
    console.log('Here is a simple example of how you should do it: \n node game Rock Paper Scossors')
} 
///

function main(computerMove, possibleMoves, wnl){
    const tg = new TableGenerator;
    console.log("Available Moves:");
    for(let i =0; i<possibleMoves.length; i++){
        console.log(`${i+1}` + ' - ' + possibleMoves[i])
    }
    console.log('0 - exit');
    console.log('? - help');

    const move = readline.question("Enter your move: ");
    if((move === '?' || (move >=0 && move <= possibleMoves.length)) && move !== '' && move !== ' '){
        if(move === '?'){
            tg.printHelpTable(possibleMoves, wnl);
            main(computerMove, possibleMoves, wnl);
        }else if(parseInt(move) === 0 && move !=='null'){
            process.exit; 
        } else {
            console.log("Your move: " + possibleMoves[move-1]);
            //HERE MUST BE COMPUTER MOVE
            console.log('Computer move: ' + possibleMoves[computerMove]);
            //HERE MUST BE WHO WINS
            let result = wnl.getWinnerOrLooser(possibleMoves, parseInt(move)-1, parseInt(computerMove));
            if(result === 'draw'){
                console.log('Draw!');
            } else if(result === 'win'){
                console.log('You Win!');
            } else if(result === 'lose'){
                console.log('Computer Wins!');
            }
            // HERE MUST BE HMAC KEY
            console.log('HMAC Key:');
            console.log(hmacKey);
        }
    } else{
        console.log('You must use only the available moves, or ? for help and 0 for exit!')
        main(computerMove, possibleMoves, wnl);
    }
}

