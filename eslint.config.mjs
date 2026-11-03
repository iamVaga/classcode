import {defineConfig} from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';
export default defineConfig([...next,{ignores:['.next/**','public/python-worker.js']},{rules:{'react-hooks/set-state-in-effect':'off'}}]);
