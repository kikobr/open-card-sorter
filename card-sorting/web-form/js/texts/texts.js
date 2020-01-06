var texts = {
    appTitle: [ `Open Card Sorter` ],
    introTitle: [ `Vamos começar%userNameComma?` ],
    introText: [
        `Nesta atividade de card sorting, queremos entender melhor como você relaciona algumas informações para projetarmos uma experiência do usuário melhor.`,
        `Ela dura em torno de <b>10 a 15 minutos</b> para ser completada. É rapidinho e vai nos ajudar muito!`,
    ],
    introPreAuth: [
        `Para iniciar, é preciso se autenticar com uma conta Google.`,
    ],
    // googleConnectPlaceholder: [`Aguarde...`],
    googleAuthConnect: [ `Conectar com Google` ],
    googleAuthConnectAs: [ `Continuar como` ],
    googleAuthDisconnect: [ `Desconectar` ],
    sidebarTitle: [`Cartões`],
    sidebarSubtitle: [`%n de %n cartões agrupados.`],

    newCardGroup: [`Arraste para criar um novo grupo`],
    cardTopDivider: [`<strong>Topo</strong>: mais relevante`],
    cardBottomDivider: [`<strong>Fundo</strong>: menos relevante`],
    cardGroupTitlePlaceholder: [`Dê um nome ao grupo`],

    steps: [
        {
            title: [`Passo 1`],
            text: [
                `Dá uma olhada nos cartões ao lado, %userName.`,
                `Sua tarefa será organizar esses cards em grupos de similaridade que façam sentido para você.`,
                `Arraste um dos cards para a direita para criar seu primeiro grupo.`
            ]
        },
        {
            title: [`Passo 2`],
            text: [
                `Mova os cartões ao lado até que todos estejam agrupados. Agrupe cartões que você considera relacionados. Você pode criar quantos grupos quiser, inclusive grupos com apenas 1 cartão!`,
                `Lembre-se, %userName: não tem certo ou errado, você escolhe como agrupar os cartões de acordo com o que fizer mais sentido para você!`
            ]
        },
        {
            title: [`Passo 3`],
            text: [
                `Revise os grupos e dê um nome para cada um que você criou. Pense em um título que represente os cartões contidos nele.`,
            ]
        },
        {
            title: [`Passo 4`],
            text: [
                `Certifique-se de ordenar os cards mais relevantes para cima e os menos relevantes para baixo em cada grupo.`,
            ]
        },
        {
            title: [`Passo 5`],
            text: [
                `Parece que ficou bom, %userName! Dê uma revisada final e depois é só clicar em “Finalizar” ali em cima para terminar.`,
            ]
        }
    ],

    endingTitle: [ `Obrigado%userNameComma!` ],
    endingText: [
        `Sua atividade vai ajudar bastante na construção de uma experiência digital incrível.`,
        `Muito obrigado pela participação!`,
    ],

    infoButton: [ `Instruções` ],
    finishButton: [ `Finalizar` ],
    resetButton: [ `Reiniciar` ],

    anonymousLabel: [ `Anônimo` ],

    alerts: {
        steps: {
            title: [`Instruções`],
            buttons: [
                { class: [`btn-primary`], text: [`Fechar`], action: "close" }
            ]
        },
        noKeys: {
            title: [`Falha ao conectar`],
            text: [
                `A chave de acesso (API_KEY) ou do cliente (CLIENT_ID) não foram inseridas corretamente.`,
                'Verifique se você gerou o link corretamente e reinicie a página.'
            ],
            buttons: [
                { class: [`btn-primary`], text: [`Fechar`], action: "close" }
            ]
        },
        noSheet: {
            title: [`Falha ao conectar`],
            text: [
                `Não foi possível acessar os dados para iniciar este card sorting. Verifique o link ou tente novamente atualizando a página.`,
                `Se o problema persistir, tente desconectar e conectar novamente seu acesso via Google.`
            ],
            buttons: [
                { class: [`btn-primary`], text: [`Tentar novamente`], action: "refresh" }
            ]
        },
        saveFail: {
            title: [`Falha ao salvar atividade`],
            text: [
                `Não possível acessar o servidor.`,
                `Tente novamente atualizando a página, desconectando e conectando novamente via Google.`
            ],
            buttons: [
                { class: [`btn-primary`], text: [`Fechar`], action: "close" },
                { class: [`btn-secondary`], text: [`Reiniciar`], action: "refresh" },
            ]
        },
    },
}
