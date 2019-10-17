#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(rlist)

source("cluster-card-sorting.R")
source("ggdendro.R")

# load datasets
default_datasets = list(
    list(name="Alfredo", file="data/Alfredo.csv"),
    list(name="Rafael", file="data/Rafael.csv")
)

# Define UI for application that draws a histogram
ui <- fluidPage(

    # Application title
    titlePanel("Card Sorting Analysis"),
    br(),

    # Sidebar with a slider input for number of bins 
    sidebarLayout(
        sidebarPanel(
            width=3,
            fileInput("files", "Load data (CSV only)",
                accept = c(
                    "text/csv",
                    "text/comma-separated-values,text/plain",
                    ".csv"),
                multiple = T
            ),
            uiOutput("clustersInput"),
            uiOutput("info"),
        ),

        # Show a plot of the generated distribution
        mainPanel(
            tabsetPanel(
                tabPanel(
                    "Hierarchical clustering",
                    div(
                        plotOutput("hclustPlot", height=700),
                        tableOutput("clustersTable")
                    )
                ),
                tabPanel(
                    "Confidence / Correlation",
                    div(
                        plotOutput("confPlot", height=900),
                        tableOutput("confTable")
                    )
                )
            )
        )
    )
)

# Define server logic required to draw a histogram
server <- function(input, output) {
    # update when file changes and feed other renders
    clusters <- reactive({
        datasets = list()
        if(!is.null(input$files)){
            for(row in 1:nrow(input$files)){
                datasets = list.append(datasets, list(
                    name=input$files[row, "name"],
                    file=input$files[row, "datapath"]
                ))
            }
        } else if(!is.null(default_datasets)){
            datasets = default_datasets
        }
        clusters <- getCardSortingClusters(datasets)
        return(clusters)
    })
    output$info <- renderUI({
        div(
            hr(),
            h5("Imported dataset:", style="font-weight: bold;"),
            p("Clusters median: ", clusters()$median_clusters),
            p("Unique cards: ", length(clusters()$cards)),
            p("Participants: ", length(unique(clusters()$base_df$Name)))
        )
    })
    output$clustersInput <- renderUI({
        sliderInput("clusters",
            "Choose clusters number",
            min = 1,
            max = nrow(clusters()$dist_matrix),
            step = 1,
            value = clusters()$median_clusters)
    })
    output$hclustPlot <- renderPlot({
        clusters <- clusters()
        if(is.null(input$clusters)) return()
        getClustersPlot(clusters$hclust, k = input$clusters)
    })
    output$clustersTable <- renderTable({
        clusters <- clusters()
        if(is.null(input$clusters)) return()
        return( getClusterTable(hclust=clusters$hclust, k=input$clusters, index_df=clusters$index_df) )
    })
    output$confPlot <- renderPlot({
        clusters <- clusters()
        if(is.null(input$clusters)) return()
        getConfPlot(clusters$conf_matrix)
    })
    output$confTable <- renderTable({
        clusters <- clusters()
        if(is.null(input$clusters)) return()
        table <- as.data.frame(round(clusters$conf_matrix, digits = 2))
        table = cbind( data.frame(colnames(table)), table )
        return( table )
    })
}

# Run the application 
shinyApp(ui = ui, server = server)
