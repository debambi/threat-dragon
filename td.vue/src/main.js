import 'mutationobserver-shim';
import Vue from 'vue';

import App from './App.vue';
import i18nFactory from './i18n/index.js';

import router from './router/index.js';
import { providerNames } from '@/service/provider/providers.js';

import storeFactory from './store/index.js';
import authActions from '@/store/actions/auth.js';
import providerActions from '@/store/actions/provider.js';
import threatmodelActions from '@/store/actions/threatmodel.js';

import './plugins/bootstrap-vue.js';
import './plugins/fontawesome-vue.js';
import './plugins/toastification.js';

Vue.config.productionTip = false;

window.electronAPI.onCloseModel((_event, fileName) =>  {
    console.warn('TODO check that any existing open model has not been modified');
    // getConfirmModal();
    console.debug('Closing model with file name : ' + fileName);
    app.$store.dispatch(threatmodelActions.clear);
    localAuth();
    app.$router.push({ name: 'MainDashboard' }).catch(error => {
        if (error.name != 'NavigationDuplicated') {
            throw error;
        }
    });
});

window.electronAPI.onSaveModel((_event, fileName) =>  {
    console.debug('Save model for file name : ' + fileName);
    app.$store.dispatch(threatmodelActions.save);
});

window.electronAPI.onOpenModel((_event, fileName, jsonModel) =>  {
    // already checked that any existing open model has not been modified
    console.debug('Open model with file name : ' + fileName);
    let params;
    // this will fail if the threat model does not have a title in the summary
    try {
        params = Object.assign({}, app.$route.params, {
            threatmodel: jsonModel.summary.title
        });
    } catch (e) {
        app.$toast.error(app.$t('threatmodel.errors.invalidJson') + ' : ' + e.message);
        app.$router.push({ name: 'HomePage' }).catch(error => {
            if (error.name != 'NavigationDuplicated') {
                throw error;
            }
        });
        return;
    }
    app.$store.dispatch(threatmodelActions.update, { fileName: fileName });
    app.$store.dispatch(threatmodelActions.selected, jsonModel);
    localAuth();
    app.$router.push({ name: `${providerNames.local}ThreatModel`, params });
});

window.electronAPI.onNewModel((_event, fileName) =>  {
    console.warn('TODO check that any existing open model has not been modified');
    // getConfirmModal();
    console.debug('New model with file name : ' + fileName);
    app.$store.dispatch(threatmodelActions.update, { fileName: fileName });
    localAuth();
    app.$router.push({ name: `${providerNames.local}NewThreatModel` });
});

const localAuth = () => {
    app.$store.dispatch(providerActions.selected, providerNames.local);
    app.$store.dispatch(authActions.setLocal);
};

const app = new Vue({
    router: router.get(),
    store: storeFactory.get(),
    render: h => h(App),
    i18n: i18nFactory.get()
}).$mount('#app');
