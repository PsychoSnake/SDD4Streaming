import * as express from 'express';

import DecisionManager from './actions/decision-manager';
import SavepointManager from './actions/savepoint-manager';
import { MetricManager } from './metrics/metric-manager';
import NewJobRequestBody from './model/request-related/new-job-creation-response';
import SddStreaming from './sdd-streaming';

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

MetricManager.startMetricMechanism();

app.post('/new-job', (req: express.Request, resp: express.Response) => {
    const jobInfo = req.body as NewJobRequestBody;
    SddStreaming.setJobInfo(jobInfo.jobName, jobInfo);
    resp.status(200).end();
});

app.get('/should-process/:jobname', async (req: express.Request, resp: express.Response) => {
    const shouldProcessInput = await DecisionManager.shouldProcessInput(req.params.jobname);
    resp.status(200).json({ shouldProcessInput }).end();
});

app.listen(port, () => console.log(`SDD4Streaming Server Application running on port ${port}!`));
