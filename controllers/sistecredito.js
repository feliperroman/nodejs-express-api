// =============================================================================
// PACKAGES
// =============================================================================
const bcrypt = require('bcrypt')
const axios = require("axios")

// =============================================================================
// HELPERS
// =============================================================================
const models = require("../helpers/models");
const { ObjectId } = require('mongodb');
const utils = require("../helpers/utils")
const { SCOrigen, OcpApimSubscriptionKey, ApplicationKey, ApplicationToken } = process.env
const defaultHeaders = {
    SCOrigen: SCOrigen,
    'Ocp-Apim-Subscription-Key': OcpApimSubscriptionKey,
    country: 'co',
    SCLocation: '0,0',
    ApplicationKey: ApplicationKey,
    ApplicationToken: ApplicationToken
}

// =============================================================================
// REST FUNCTIONS
// =============================================================================

async function getBankList(req, res) {
    try {
        const response = axios.get('https://api.credinet.co/pseavanza/getBankList?serviceCode=1', {
            headers: defaultHeaders
        })
        return response.data
    } catch (error) {
        console.log("getBankList error", error)
    }
}

async function createPayment(req, res) {
    try {
        // 1. Validación de datos de entrada
        const { docType, document, name, lastName, email, phone, city, address } = req.body;
        if (!docType || !document || !name || !lastName || !email || !phone || !city || !address) {
            return res.status(400).json({
                message: 'DocType, Document, Name, LastName, Email, Phone, City, and Address are required fields',
            });
        }

        // 2. Preparación de los datos para la solicitud
        const data = {
            "description": "Transaccion pago ruta",
            "paymentMethod": {
                "paymentMethodId": 2, // Cambia esto según el método de pago elegido
                "bankCode": 1, // Cambia esto según el banco elegido
                "userType": 0
            },
            "currency": "COP",
            "value": 10000, // Cambia esto según el valor del pago
            "tax": 19,
            "taxBase": 10000,
            "urlResponse": "https://www.espiritudemontana.com/",
            "urlConfirmation": "https://www.espiritudemontana.com/confirmation",
            "methodConfirmation": "POST",
            "client": {
                "docType": docType,
                "document": document,
                "name": name,
                "lastName": lastName,
                "email": email,
                "indCountry": "57", // Cambia esto según el país
                "phone": phone,
                "country": "co", // Cambia esto según el país
                "city": city,
                "address": address,
                "ipAddress": "192.158.1.38"
            }
        };

        // 3. Realizar la solicitud POST a la API de Credinet
        const response = await axios.post('https://api.credinet.co/pay/create', data, {
            headers: defaultHeaders
        });

        // 4. Procesar la respuesta de la API
        const { data: dataPayment, ...rest } = response.data;
        console.log(response.data);

        if (rest.errorCode === 0 && dataPayment._id) {
            // 5. Si la creación fue exitosa, iniciar el long polling
            await handleTransactionStatus(dataPayment._id, res);
        } else {
            // 6. Si la creación falló, devolver un error
            res.json({ error: true, data: response.data });
        }
    } catch (error) {
        console.error('createPayment ~ error:', error);
        return res.status(500).json({ message: 'Error creating transaction' });
    }
}

async function handleTransactionStatus(id, res) {
    try {
        while (true) {
            // 7. Obtener el estado de la transacción
            const response = await axios.get(`https://api.credinet.co/pay/GetTransactionResponse?transactionId=${id}`, {
                headers: defaultHeaders
            });

            const statusResponse = response.data.data.transactionStatus;
            console.log("🚀 ~ handleTransactionStatus ~ response.data.data:", response.data)
            console.log("Status:", statusResponse);

            // 8. Verificar si el estado es PendingForPaymentMethod
            if (statusResponse === 'PendingForPaymentMethod') {
                // 9. Si es PendingForPaymentMethod, esperar 5 segundos y volver a consultar
                await delay(2000);
            } else {
                // 10. Si el estado ha cambiado, enviar la respuesta al cliente
                const paymentRedirectUrl = response.data.data.paymentMethodResponse?.paymentRedirectUrl;

                if ([ 'Rejected', 'Cancelled', 'Expired', 'Abandoned', 'Failed'].includes(statusResponse)) {
                    // 11. Si la transacción ha finalizado (éxito o fracaso), enviar el estado
                    res.json({
                        error: true,
                        status: statusResponse,
                        description: response.data.data.description
                    });
                } else {
                    // 12. Si la transacción está lista para redirección, enviar la URL
                    res.json({paymentRedirectUrl: paymentRedirectUrl});
                }

                return; // Terminar el polling
            }
        }
    } catch (error) {
        console.error("Error al consultar la transacción:", error);
        res.status(500).send("Error al consultar la transacción");
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// async function createPayment(req, res) {
//     try {
//         // const {
//         //     invoice,
//         //     description,
//         //     value,
//         //     paymentMethod
//         // } = req.body;

//         // if (!invoice || !description || !paymentMethod || !value) {
//         //     return res.status(400).json({
//         //         message: 'Invoice, Description, paymentMethod and Value are required fields',
//         //     })
//         // }
//         const body = req.body

//         let data = {
//             "invoice": "test01010",
//             "description": "Prueba transaccion",
//             "paymentMethod": {
//                 "paymentMethodId": 2,
//                 "bankCode": 1,
//                 "userType": 0
//             },
//             "currency": "COP",
//             "value": 10000,
//             "tax": 19,
//             "taxBase": 10000,
//             "urlResponse": "https://www.espiritudemontana.com/",
//             "urlConfirmation": "https://www.espiritudemontana.com/confirmation",
//             "methodConfirmation": "POST",
//             "client": {
//                 "docType": body.docType,
//                 "document": body.document,
//                 "name": body.name,
//                 "lastName": body.lastName,
//                 "email": body.email,
//                 "indCountry": "57",
//                 "phone": body.phone,
//                 "country": "co",
//                 "city": body.city,
//                 "address": body.address,
//                 "ipAddress": "192.158.1.38"
//             }
//         }
//         console.log("🚀 ~ createPayment ~ data:", data)

//         await axios.post('https://api.credinet.co/pay/create', body, {
//             headers: defaultHeaders
//         }).then(async (data) => {
//             const { data: dataPayment, ...rest } = data.data
//             console.log(data.data)
//             if (rest.errorCode === 0 && dataPayment._id) {
//                 // res.status(201).json({ message: rest.message, id: dataPayment._id, transactionStatus: dataPayment.transactionStatus })
//                 await getTransactionById(dataPayment._id, res)
//             } else {
//                 res.json({ error: true, data: data.data })
//             }
//         }).catch((error) => {
//             console.log(error)
//             res.json({ error: true, data: error })

//         })
//     } catch (error) {
//         console.error('createPayment ~ error:', error);
//         return res.status(500).json({ message: 'Error creating transaction' });
//     }
// }



// async function getTransactionById(id, res) {
//     try {
//         await axios.get(`https://api.credinet.co/pay/GetTransactionResponse?transactionId=${id}`, {
//             headers: defaultHeaders
//         })
//             .then(async (data) => {
//                 console.log("then data:", data.data)
//                 console.log("then data:", data.data.data.paymentMethodResponse)
//                 if (data.data.data.transactionStatus === 'PendingForPaymentMethod') {
//                     await axios.get(`https://api.credinet.co/pay/GetTransactionResponse?transactionId=${id}`, {
//                         headers: defaultHeaders
//                     })
//                         .then(async (data) => {
//                             console.log("then data 2:", data.data)
//                             console.log("then data 2:", data.data.data.paymentMethodResponse)
//                             if (data.data.data.paymentMethodResponse.paymentRedirectUrl !== null) {
//                                 res.json(data.data.data.paymentMethodResponse.paymentRedirectUrl)
//                             }
//                         })
//                 } else {
//                     if (data.data.data.paymentMethodResponse.paymentRedirectUrl !== null) {
//                         res.json(data.data.data.paymentMethodResponse.paymentRedirectUrl)
//                     }
//                 }
//             }).catch((error) => {
//                 console.log("🚀 ~ .then ~ error:", error)

//             })
//     } catch (error) {
//         console.log("🚀 ~ getTransactionById ~ error:", error)
//     }
// }

// async function longPolling() {

// }


module.exports = {
    get: {
        getBankList
    },
    post: {
        createPayment
    }
}