import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const canvasApiToken = process.env.CANVAS_API_TOKEN;
const canvasBaseUrl = process.env.CANVAS_BASE_URL;



if (!canvasApiToken || !canvasBaseUrl) {
    throw new Error('Missing Canvas API token or base URL in environment variables');
}
const filePath = path.join(__dirname, 'coursesMapping.json');
if (!fs.existsSync(filePath)) {
    throw new Error(`Please create a JSON file here, see Readme for details...  ${filePath}`);
}
const fileContent = fs.readFileSync(filePath, 'utf8');
const { courseIdToDescriptions } = JSON.parse(fileContent);

async function getModules(courseId: string) {
    const response = await axios.get(`${canvasBaseUrl}/courses/${courseId}/modules`, {
        headers: {
            'Authorization': `Bearer ${canvasApiToken}`
        }
    });
    return response.data;
}

async function getModuleItems(courseId: string, moduleId: string) {
    const response = await axios.get(`${canvasBaseUrl}/courses/${courseId}/modules/${moduleId}/items`, {
        headers: {
            'Authorization': `Bearer ${canvasApiToken}`
        }
    });
    return response.data;
}

/**
 * Currently I get 403 with my not so powerful Access token :(
 * @param courseId
 * @param moduleId
 */
async function getCourseFiles(courseId: string, moduleId: string) {
    const response = await axios.get(`${canvasBaseUrl}/courses/${courseId}/files/${moduleId}`, {
        headers: {
            'Authorization': `Bearer ${canvasApiToken}`
        }
    });
    return response.data
}

async function downloadPDF(url: string, fileName: string, courseId: string): Promise<void> {
    try {
        if(!courseId){
            throw new Error('Missing courseId');
        }
        const downloadsFolder = path.join(__dirname, `downloads/${courseId}`);
        if (!fs.existsSync(downloadsFolder)) {
            fs.mkdirSync(downloadsFolder);
        }
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${canvasApiToken}`
            },
            responseType: 'arraybuffer',
        });
        //Avoid fancy naming by professors...
        fileName = fileName.replace(/[^\x00-\x7F]/g, '_').replace(/\//g, '_').toLowerCase();
        const filePath = path.join(downloadsFolder, fileName);
        fs.writeFileSync(filePath, response.data);
        console.log(`File saved: ${filePath}`);
    } catch (error) {
        console.log(`Error downloading PDF: ${fileName}`, error);
    }
}

async  function getSlidesUrl(item: any){
    try{
        const response = await axios.get(item.url, {
            headers: {
                'Authorization': `Bearer ${canvasApiToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }catch (error){
        console.error(error)
        return null;
    }
}

async function savePdfFiles(courseId: string, courseDescr: string) {
    const modules = await getModules(courseId);
    const externalUrls: { url: string, title: string }[] = [];




    for (const module of modules) {
        const moduleItems = await getModuleItems(courseId, module.id);

        let index = 0;

        for (const item of moduleItems) {
            if (item.type === 'File' ) {
                const response = await getSlidesUrl(item)

                if(response != null){
                   downloadPDF(response.url, item.title? item.title : index.toString() + '.'+ response.mime_class ?response.mime_class : 'pdf' , courseDescr).catch(() => {
                        console.error('Error downloading PDF');
                   });
               }
            }else if(item.type === 'ExternalUrl'){
                externalUrls.push({url: item.external_url, title: item.title});
            }
            index +=1;
        }
    }
    return externalUrls;
}

function createCSV(data: { url: string, title: string }[], item: {descr:string, code: string}) {
    const csvLines = data.map(item => `${item.title},${item.url}`);
    const csvContent = csvLines.join('\n');

    const downloadsFolder = path.join(__dirname, `downloads`);
    if (!fs.existsSync(downloadsFolder)) {
        throw new Error("Please create a 'downloads' folder in the current directory");
    }
    const filePath = path.join(__dirname, `downloads/${item.descr}/000_External_Resources_${item.descr}.csv`)
    fs.writeFileSync(filePath, csvContent, 'utf8');
}



(async () => {
    try {
        courseIdToDescriptions.forEach(async (item) => {
            const externalUrls: {url: string, title: string}[]= await savePdfFiles(item.code, item.descr);
            createCSV(externalUrls, item);
        });
    } catch (error) {
        console.error('Error fetching PDF files:', error);
    }
})();