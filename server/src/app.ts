import { Server } from './server'

const pluginConfigPath = process.env.NODE_ENV === 'production' ? '../../../plugin-config.prod.json' : '../../../plugin-config.dev.json'

const server = new Server(pluginConfigPath);
