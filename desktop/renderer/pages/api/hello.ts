import Cors from 'cors';

// Initialize CORS middleware
const cors = Cors({
    origin: '*',  // Allow all origins, you can change this to a specific origin in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
});

// Helper to run middleware
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default function handler(req, res) {

    console.log('rerere');
    try {
        switch (req.method) {
           
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(500).end(`Error ${JSON.stringify(error)}`);
    }


}