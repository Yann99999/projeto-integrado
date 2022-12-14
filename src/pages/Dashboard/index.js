
import './dashboard.css';
import { useState, useEffect } from 'react';

import Header from '../../components/Header';
import Title from '../../components/Title';
// import Modal from '../../components/Modal';
import firebase from '../../services/firebaseConnection';

import { FiMessageSquare, FiPlus, FiSearch, FiEdit2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard(){
  const listRef = firebase.firestore().collection('chamados').orderBy('created', 'asc')
  const [chamados, setChamados] = useState([])
  const [loading, setLoading] = useState(true)
  const [carregarMais, setCarregarMais] = useState(false)
  const [isVazio, setIsVazio] = useState(false)
  const [ultimoDocs, setUltimoDocs] = useState()
  const [mostrarModal, setMostrarModal] = useState(false)
  const [detalhe, setDetalhe] = useState()

  useEffect(()=>{
    async function carregarChamados(){
      await listRef.limit(5)
      .get()
      .then((snapshot)=>{
        atualizarEstado(snapshot)
      })
      .catch((error)=>{
        console.log(error)
        setCarregarMais(false)
      })
      
      setLoading(false)
    }
  
    carregarChamados()
    
    return () => {}
  }, [])

  
  async function atualizarEstado(snapshot){
    const isCollectionEmpty = snapshot.size === 0
    
    if(!isCollectionEmpty){
      let lista = []
      
      snapshot.forEach((doc)=>{
        lista.push({
          id: doc.uid,
          assunto: doc.data().assunto,
          cliente: doc.data().cliente,
          clienteId: doc.data().clienteId,
          created: doc.data().created,
          createdFormated: format(doc.data().created.toDate(), 'dd/MM/yyyy'),
          status: doc.data().status,
          complemento: doc.data().complemento
        })
      })

      const ultimoDoc = snapshot.docs[snapshot.docs.length - 1] //Pegando o ultimo documento buscado
      setChamados(chamados => [...chamados, ...lista])
      setUltimoDocs(ultimoDoc)
    }else{
      setIsVazio(true)
    }
    setCarregarMais(false)
  }

  async function carregarMaisChamados(){
    setCarregarMais(true)

    await listRef.startAfter(ultimoDocs).limit(5)
    .get()
    .then((snapshot)=>{
      atualizarEstado(snapshot)
    })
  }

  function saltarModal(item){
    setMostrarModal(!mostrarModal) // trocando de true p false, ou vice-versa
    setDetalhe(item)
  }

  if(loading){
    return(
      <div>
        <Header/>

        <div className="content">
        <Title name="Tabela de Alunos">
            <FiMessageSquare size={25} />
          </Title>
          <div className='container dashboard'>
            <span>Buscando chamados...</span>
          </div>
        </div>
      </div>
    )
  }
  return(
    <div>
      <Header/>

      <div className="content">
      <Title name="Tabela de Alunos">
            <FiMessageSquare size={25} />
          </Title>
        {chamados.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum aluno registrado...</span>

            <Link to="/new" className="new">
              <FiPlus size={25} color="#FFF" />
              Novo chamado
            </Link>
          </div>
        )  : (
          <>
            <Link to="/new" className="new">
              <FiPlus size={25} color="#FFF" />
              Novo aluno
            </Link>

            <table>
              <thead>
                <tr>
                  <th scope="col">Cliente</th>
                  <th scope="col">Assunto</th>
                  <th scope="col">Status</th>
                  <th scope="col">Cadastrado em</th>
                  <th scope="col">#</th>
                </tr>
              </thead>
              <tbody>

                {chamados.map((item, index)=>{
                  return(
                    <tr key={index}>
                      <td data-label="Cliente">{item.cliente}</td>
                      <td data-label="Assunto">{item.assunto}</td>
                      <td data-label="Status">
                        <span className="badge" style={{ backgroundColor: item.status === 'Atendido' ? '#5cb85c'  : '#999'}}>{item.status}</span>
                      </td>             
                      <td data-label="Cadastrado">{item.createdFormated}</td>
                      <td data-label="#">
                        <button className="action" style={{backgroundColor: '#3583f6' }} onClick={()=> saltarModal(item)}>
                          <FiSearch color="#FFF" size={17} />
                        </button>
                        <button className="action" style={{backgroundColor: '#F6a935' }}>
                          <FiEdit2 color="#FFF" size={17} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
               
              </tbody>
            </table>

            {carregarMais && <h3 style={{textAlign: 'center', marginTop: 15}}>Buscando dados...</h3>}
            {!carregarMais && !isVazio && <button className='btn-more' onClick={carregarMaisChamados}>Buscar mais</button>}
          </>
        )}

      </div>
{/* 
      {mostrarModal && (
        <Modal 
        conteudo = {detalhe}
        close={saltarModal}
        />
      )} */}
    </div>
  )
}