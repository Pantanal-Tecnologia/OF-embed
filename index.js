class OfEmbed {
  callback = () => {}
  devMode = false
  token = null
  sistema = null
  tipo = null
  stackId = null
  user = null
  hash = null
  endPointBack = 'https://of.pantanaltec.com.br'
  endPointFront = 'https://of.pantanaltec.com.br'

  setSistema = (sistema) => this.sistema = sistema
  setToken = (token) => this.token = token
  setDevMode = (devMode) => {
    this.devMode = devMode
    if(this.devMode) {
      this.endPointBack = 'http://localhost:3000'
      this.endPointFront = 'http://localhost:8080'
    } else {
      this.endPointBack = 'https://of.pantanaltec.com.br'
      this.endPointFront = 'https://of.pantanaltec.com.br'
    }
  }

  addModal(src, target) {

    // Criar o iframe
    const iframe = document.createElement('iframe');
    iframe.classList.add('modal-iframe');
    const url = this.endPointFront + src
    console.log(url)
    iframe.src = url

    if (!target) {
      // Criar o fundo escuro do modal
      const modalBackground = document.createElement('div');
      modalBackground.classList.add('modal-background');
      
      // Criar o conteúdo do modal
      const modalContent = document.createElement('div');
      modalContent.classList.add('modal-content');
      
      
      // Adicionar o iframe ao conteúdo do modal
      modalContent.appendChild(iframe);
  
      // Adicionar o conteúdo do modal ao fundo escuro
      modalBackground.appendChild(modalContent);
  
      // Adicionar ao body
      document.body.appendChild(modalBackground);
  
      // Exibir o modal ao clicar no fundo escuro (isso é apenas um exemplo, pode ser controlado de outras maneiras)
      modalBackground.addEventListener('click', () => this.closeModal(modalBackground));
  
      // Exibir o modal (isso é apenas um exemplo, pode ser feito com base em algum evento específico)
      modalBackground.style.display = 'block';
      return modalBackground
    } else {
      target?.appendChild(iframe);
    }
  }
  addWindow (src) {
    const url = this.endPointFront + src
    const width = window.innerWidth * 0.8
    const height = window.innerHeight * 0.8
    // window.open(url, 'ofNfValidation', `width=${width},height=${height},location=yes`);
    window.open(url, 'ofNfValidation');
  }
  closeModal (modal) {
    modal.style.display = 'none'; // Esconde o modal
    setTimeout(() => {
      document.body.removeChild(modal);
      modal = undefined
    }, 1000);
    try {
      this.callback()
    } catch (error) {
    }
  }
  validacaoFornecedor(layout, transacoes, callback = el => true, DocAdd = [], options = null) {
    console.log(options)
    let params = {
      modal: true,
      target: false
    }
    if (typeof options === "object") {
      params = {
        ...params,
        ...options
      }
    }
    console.log(params)

    this.callback = callback
    const transacoesJoined = transacoes.join(',')
    const docAddJson = JSON.stringify(DocAdd)
    const src = `/#/API/${this.sistema}/validacaoFornecedor/${layout}/${transacoesJoined}/${this.token}/${btoa(docAddJson)}`
    let modal = null
    if (params.modal) {
      modal = this.addModal(src, params.target)
    } else {
      this.addWindow(src)
    }
    window.addEventListener("message", (event) => {
      console.log('message FROM', event.origin, this.endPointFront, this.endPointFront == event.origin)
      // Verificar a origem da mensagem por razões de segurança
      if (event.origin !== this.endPointFront) {
          return; // Não é a origem esperada, não faça nada
      }
      // Processar a mensagem
      console.log("Mensagem recebida:", event.data, event.data == 'OK');
      if (event.data == 'OK') {
        if (modal) {
          this.closeModal(modal)
        }
        // REALIZAR ACOES DE EXECUCAO
        callback()
      } else {
        alert(event.data)
      }
  }, false);
  }
  getTransacoesDocStatus(layout,transacoes, callback = el => true) {
    // getTransacoesDocStatus(transacoes, callback = el => true) {
    return new Promise((resolve, reject) => {
      const header = new Headers();
      header.append('Content-Type', 'application/json;charset=UTF-8')
      header.append('Access-Control-Allow-Origin', '*')
      header.append('x-access-token', this.token)
      let data = {
        layout: layout,
        sistema: this.sistema,
        transacoes: transacoes
      }
      const init = {
        body: JSON.stringify(data),
        method: "POST",
        headers: header,
        mode: "cors",
        cache: "default",
      };
      

      fetch(this.endPointBack + '/loadRelatorioTransacoesDataAPI' , init)
        .then(async function (res) {
          const data = await res.json()
          const result = {}
          data?.transacoes?.forEach(element => {
            if (!result[element.produtoId]) result[element.produtoId]= {}
            result[element.produtoId][element.id] = element.nfId ? element.docs : false
          })
          resolve(result)
        }).catch( e => reject(e))
    })
  }
  // MODELO DE OBJ : obj = {
  //   cliente : number,
  //   contrato : number,
  //   credenciador : number,
  //   departamento : number,
  //   fornecedor : number,
  //   produto : number,
  //   secretaria : number,
  //   sistema : number,
  // }
  getPreData (obj) {
    return new Promise ((resolve, reject) => {
    if (!(obj.cliente &&
      obj.contrato &&
      obj.credenciador &&
      obj.departamento &&
      obj.fornecedor &&
      obj.produto &&
      obj.secretaria &&
      obj.sistema) ) {
        console.log(obj)
        throw 'Dados Invalidos'
      }
      // const url = `/getValidationData/${obj.sistema}/${obj.credenciador}/${obj.cliente}/${obj.secretaria}/${obj.departamento}/${obj.contrato}/${obj.produto}/${obj.fornecedor}`
      let url = `/getValidationData?sistema=${obj.sistema}&credenciador=${obj.credenciador}&cliente=${obj.cliente}&secretaria=${obj.secretaria}&departamento=${obj.departamento}&contrato=${obj.contrato}&produto=${obj.produto}&fornecedor=${obj.fornecedor}`
      if (obj.layout) {
        url += `&layout=${obj.layout}`
      }
      if (obj.transacoes) {
        url += `&transacoes=${obj.transacoes}`
      }
      fetch(this.endPointBack + url).then(result => {
        resolve(result.json())
      }).catch(e => {
        reject(e)
      })
    })
  }  
}
