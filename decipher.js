/**
 * @author: Abrar Hayat <abrarh@unimelb.edu.au>
 * @since: Thu, 03 Aug 2023
 */

const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv').config()
const filename = 'words_dictionary.json';

const apiKey = process.env.DICT_API_KEY;
let cipherText = "efgfoe uif fbtu xbmm pg uif dbtumf";

const breakCaesarCipher = async (cipherText, local) => {
    let wordData = null;
    if (local) {
        try {
            const wordFile = fs.readFileSync(filename, 'utf8');
            try {
                wordData = JSON.parse(wordFile);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        } catch (err) {
            console.error('Error reading the file:', err);
            return;
        }
    }
    cipherText = cipherText.toUpperCase();
    cipherText = cipherText.replaceAll(/\s/g, '_');
    let decipheredText = "";
    let maxValidWords = 0;
    let plainText = "";
    for (let shift = 1; shift < 26; shift++) {
        decipheredText = "";
        for (let index = 0; index < cipherText.length; index++) {
            if (cipherText.charCodeAt(index) !== 95) {
                let ascii = cipherText.charCodeAt(index) - shift;
                if (ascii < 65) {
                    ascii = 90 - (65 - ascii - 1);
                }
                if (ascii > 90) {
                    ascii = ascii - 25;
                }
                decipheredText = decipheredText + String.fromCharCode(ascii)
            } else {
                decipheredText = decipheredText + " ";
            }
        }
        // console.log(decipheredText)
        const wordsToCheck = decipheredText.split(/\s/g)
        let validWords = 0;
        for (let index = 0; index < wordsToCheck.length; index++) {
            let validWord = false;
            if (local) {
                validWord = isValidWordLocal(wordData, wordsToCheck[index]);
            } else {
                validWord = await isValidWord(wordsToCheck[index]);
            }
            if (validWord) {
                validWords++;
            }
        }
        if (validWords > maxValidWords) {
            plainText = decipheredText;
            maxValidWords = validWords;
        }
    }
    console.log("Deciphered Plain Text:", plainText)
}

const isValidWord = async (wordToCheck) => {
    return axios.get(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${wordToCheck}?key=${apiKey}`)
        .then(response => {
            const data = response.data;
            if (Array.isArray(data) && data.length > 0) {
                // console.log(`${wordToCheck} is a valid English word.`);
                return true;
            } else {
                // console.log(`${wordToCheck} is not a valid English word.`);
                return false;
            }
        })
        .catch(error => console.error('Error:', error));
}

function isValidWordLocal(wordData, wordToCheck) {
    wordToCheck = wordToCheck.toLowerCase();
    const hasWord = wordData.hasOwnProperty(wordToCheck);
    if (hasWord) {
        // console.log(`The word "${wordToCheck}" exists in the JSON file.`);
        return true;
    } else {
        return false;
        // console.log(`The word "${wordToCheck}" does not exist in the JSON file.`);
    }
}

breakCaesarCipher(cipherText, true);