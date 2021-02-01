const Modal = {
    open() {
        // abrir modal
        // adicionar a classe active ao modal
        document.querySelector('.modal-overlay')
                .classList
                .add('active');
    },
    close () {
        // fechar o modal
        // remover a classe active ao modal
        document.querySelector('div.active')
                .classList
                .remove('active');

        Form.clearFields();
    }
};
const Storage =  {
    tName: 'dev.finances:transactions',
    get(){
        return JSON.parse(localStorage.getItem(Storage.tName)) || [];
    },
    set(transactions) {
        localStorage.setItem(Storage.tName, JSON.stringify(transactions));
    }
}

const Transactions = {
    all: Storage.get(),
    add(transaction){
        Transactions.all.push(transaction);
        App.reload();
    },
    remove(index) {
        Transactions.all.splice(index, 1);
        App.reload();
    }
    ,
    incomes() {
        // somar as entradas
        let income = 0;
        Transactions.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income +=  transaction.amount;

            }
        })
        return income; 
    },
    expenses() {
        // somar as saídas
        let expense = 0;
        Transactions.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense +=  transaction.amount;

            }
        })
        return expense; 
    },
    total() {
        
        return Transactions.incomes()+ Transactions.expenses();
    },

};

// Substituir os dados do HTML por dados do JS
const DOM = {
    transactionsContainer:document.querySelector("#data-table tbody"),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);

    },

    innerHTMLTransaction(transaction, index) {
        const CssClass = (transaction.amount >0) ? 'income' : 'expense';
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
        `;
        return html;
    },
    
    updateBalance(){
        document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transactions.incomes());
        
        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transactions.expenses());

        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transactions.total());
        
            document.querySelector('.card.total').style.backgroundColor = (Transactions.total() < 0) 
                                                                            ? 'var(--red)' 
                                                                            : "var(--green)";
        
    },
    clearTransactions(){
        this.transactionsContainer.innerHTML = '';
    },
}
const Utils =  {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '';
        
        value = String(value).replace(/\D/g, '');
        
        value = Number(value)/100;
        
        value = value.toLocaleString('pt-BR', {
            style:'currency',
            currency:'MZN' // BRL => real | MZN => Metical
        });
        
        return signal + value;
        
        
        // console.log();
    },
    
    formatAmount(value) {
        value = Number(value.replace(/\.\,/g), "") * 100;
        return value; 
    },

    formatDate(value){
        const splittedDate = value.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
    validadeFields(fields){
            const {description, amount, date} = Form.getValues();
            if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
                throw new Error("Por favor, preencha todos os campos");
            }

    },
    formatValues(){
        let {description, amount, date} = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date,
        }
    },
    clearFields(){
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
    }
    ,
    submit(event) {
        event.preventDefault();
        try {
            Form.validadeFields();
            const transaction = Form.formatValues();
            Transactions.add(transaction);
            Form.clearFields();
            Modal.close();
            
        } catch (error) {
            alert(error.message)
        }

    }
}


const App = {
    init(){
        
        Transactions.all.forEach(
            DOM.addTransaction
            )
            DOM.updateBalance();
            Storage.set(Transactions.all)
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    }
}
App.init();