class OfEmbed {
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

  addModal(src) {

    // Criar o fundo escuro do modal
    const modalBackground = document.createElement('div');
    modalBackground.classList.add('modal-background');
    
    // Criar o conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    
    // Criar o iframe
    const iframe = document.createElement('iframe');
    iframe.classList.add('modal-iframe');
    const url = this.endPointFront + src
    console.log(url)
    iframe.src = url
    
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
  }
  closeModal (modal) {
    modal.style.display = 'none'; // Esconde o modal
    setTimeout(() => {
      document.body.removeChild(modal);
      modal = undefined
    }, 1000);

  }
  validacaoFornecedor(layout, transacoes, callback = el => true) {
    const transacoesJoined = transacoes.join(',')
    const modal = this.addModal(`/#/API/${this.sistema}/validacaoFornecedor/${layout}/${transacoesJoined}/${this.token}/${btoa(window.origin)}`)
    window.addEventListener("message", (event) => {
      console.log('message FROM', event.origin, this.endPointFront, this.endPointFront == event.origin)
      // Verificar a origem da mensagem por razões de segurança
      if (event.origin !== this.endPointFront) {
          return; // Não é a origem esperada, não faça nada
      }
      // Processar a mensagem
      console.log("Mensagem recebida:", event.data, event.data == 'OK');
      if (event.data == 'OK') {
        this.closeModal(modal)
        // REALIZAR ACOES DE EXECUCAO
        callback()
      } else {
        alert(event.data)
      }
  }, false);
  }

  getTransacoesDocStatus(transacoes, callback = el => true) {
    return new Promise((resolve, reject) => {
      const header = new Headers();
      header.append('Content-Type', 'application/json;charset=UTF-8')
      header.append('Access-Control-Allow-Origin', '*')
      header.append('x-access-token', this.token)
      let data = {
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
            result[element.produtoId][element.id] = element.nfId || false
          })
          resolve(result)
        }).catch( e => reject(e))
    })
  }
}
